
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role"); // Import Role model
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { sendVerificationEmail } = require("../utils/emailService");
const { sendResetPasswordEmail } = require("../utils/emailService");

const signup = async (req, res) => {
    try {

        console.log("Signup – req.body =", req.body);
        // التحقق من وجود أخطاء في التحقق
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation error in signup:", errors.array());
            return res.status(422).json({
                success: false,
                message: "Validation error",
                errors: errors.array(),
            });
        }

        const { name, email, password } = req.body;
        console.log("Signup attempt with:", { name, email, password });

        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({
            $or: [{ email }, { name }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                console.log("User with this email already exists:", email);
                return res.status(422).json({
                    success: false,
                    message: "user with this email already exists",
                });
            }
            console.log("User with this username already exists:", name);
            return res.status(422).json({
                success: false,
                message: "user with this username already exists",
            });
        }

        // Find the default 'user' role
        const defaultRole = await Role.findOne({ name: 'user' });
        if (!defaultRole) {
            return res.status(500).json({ success: false, message: 'Default user role not found. Please create it first.' });
        }

        // إنشاء رمز التحقق
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        // إنشاء المستخدم
        const user = new User({
            name,
            email,
            password,
            verificationTokenExpiry,
            verificationToken,
            role: defaultRole._id, // Assign default role ID
        });

        await user.save();
        console.log("User created successfully:", { name, email });
        await sendVerificationEmail(email, verificationToken);


        res.status(201).json({
            success: true,
            message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: defaultRole.name, // Return role name
                isVerified: user.isVerified,
            },
        });

    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email);

        // البحث عن المستخدم
        const user = await User.findOne({ email }).populate('role');
        console.log("Found user:", user ? "Yes" : "No");

        if (!user) {
            console.log("User not found during login:", email);
            return res.status(401).json({
                success: false,
                message: "email or password does not match",
            });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.log("Invalid password for user:", email);
            return res.status(401).json({
                success: false,
                message: "email or password does not match",
            });
        }

        // if(!user.isVerified){
        //   console.log("Unverified user attempt to login:", email);
        //   return res.status(403).json({
        //     success: false,
        //     message: "Please verify your email before logging in",
        //   });
        // }

        console.log("Login successful:", email);
        // إنشاء التوكن
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role.name, // Use role name
                permissions: user.role.permissions, // Include permissions from role
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "10s" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id, role: user.role.name }, // Use role name
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

      

        // إعداد الكوكيز
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15  * 1000, // 15 minutes
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });




        res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح",
            accessToken: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                permissions: user.role.permissions, // Return permissions from role
                role: user.role.name, // Return role name
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const logout = async (req, res) => {
    try {
        // مسح جميع الكوك
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        res.json({
            success: true,
            message: "تم تسجيل الخروج بنجاح",
        });
    } catch (error) {
        console.error('Error logging out:', error);
        handleServerError(res, error);
    }
};


const me = (req, res) => {
    try {
        const user = req.user
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role.name, // Return role name
                isVerified: user.isVerified,
                permissions: user.role.permissions // Return permissions from role
            }
        });
    } catch (error) {
        logger.error('Error in auth check:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const refresh = async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "توكن التحديث غير موجود",
        });
      }
  
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  
      // Create new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "900s" }
      );
  
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
  
      res.json({
        success: true,
        message: "تم تحديث التوكن بنجاح",
        token: accessToken,
      });
    } catch (error) {
      console.error("Refresh error:", error);
      return res.status(401).json({
        success: false,
        message: "توكن التحديث غير صالح",
      });
    }
  };
  


  const verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
  
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }
  
      // ✅ فعل الحساب
      user.isVerified = true;
      await user.save(); // احفظ حالة التفعيل الآن
  
      // ⏳ احذف التوكن بعد 2 ثانية
      setTimeout(async () => {
        try {
          user.verificationToken = undefined;
          user.verificationTokenExpiry = undefined;
          await user.save(); // احفظ الحذف
        } catch (e) {
          console.error("فشل حذف التوكن بعد التأخير:", e);
        }
      }, 7000); 
  
      // ✅ الرد يرجع فورًا بعد التفعيل
      res.json({
        success: true,
        message: "Email verified successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
  

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

    
        // إنشاء رمز تحقق جديد
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = Date.now() + 3600000; // 1 ساعة

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();

        // إرسال بريد التحقق
        await sendVerificationEmail(email, verificationToken);

        res.json({
            success: true,
            message: "تم إرسال رمز التحقق. يرجى التحقق من بريدك الإلكتروني",
        });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};






const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // إنشاء رمز إعادة التعيين
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 2*60*1000; // ساعة واحدة

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save({validateBeforeSave: false});

        // إرسال بريد إعادة التعيين
        await sendResetPasswordEmail(email, resetToken);



        res.json({
            success: true,
            message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        });
    } catch (error) {
        console.error('Error sending reset password email:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};






const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({validateBeforeSave: false});



        res.json({
            success: true,
            message: "تم إعادة تعيين كلمة المرور بنجاح",
        });
    } catch (error) {
        console.error('Error reseting password:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};


const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        // البحث عن المستخدم بواسطة رمز إعادة التعيين
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        res.json({
            success: true,
            message: "رمز إعادة التعيين صالح",
        });
    } catch (error) {
        console.error('Error verifying reset token:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password').populate('role', 'name permissions');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateUserRoleAndPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleName } = req.body; // Expect roleName instead of role and permissions

        const userToUpdate = await User.findById(userId).populate('role');

        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent updating superadmin
        if (userToUpdate.role.name === 'superadmin') {
            return res.status(403).json({ success: false, message: 'Cannot modify a superadmin account' });
        }

        // Find the new role by name
        const newRole = await Role.findOne({ name: roleName });
        if (!newRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        userToUpdate.role = newRole._id; // Assign the new role's ID

        await userToUpdate.save();

        // Re-populate the role to return the full role object in the response
        await userToUpdate.populate('role');

        res.json({ success: true, message: 'User updated successfully', user: userToUpdate });
    } catch (error) {
        console.error('Error updating user role and permissions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userToDelete = await User.findById(userId).populate('role');

        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting superadmin
        if (userToDelete.role.name === 'superadmin') {
            return res.status(403).json({ success: false, message: 'Cannot delete a superadmin account' });
        }

        await userToDelete.deleteOne();

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, roleName } = req.body; // Expect roleName instead of role and permissions

        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email or name already exists' });
        }

        // Find the role by name
        const role = await Role.findOne({ name: roleName });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: role._id, // Assign the role's ID
        });

        await newUser.save();

        // Populate the role to return the full role object in the response
        await newUser.populate('role', 'name permissions');

        res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const xyz = (req, res) => {
    res.send('Hello aaaa');
    console.log("done");
}




module.exports = {
    xyz, signup, login, logout, me, refresh, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, verifyResetToken, getAllUsers, updateUserRoleAndPermissions, deleteUser, createUser
};