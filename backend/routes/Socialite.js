const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Constants
const APP_URL = 'http://localhost:5173';
const ROUTES = {
    LOGIN: `${APP_URL}/login`,
    SUCCESS: `${APP_URL}/auth/success`
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Set authentication cookies
const setAuthCookies = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
};

// Handle OAuth callback
const handleOAuthCallback = (provider) => async (req, res, next) => {
    passport.authenticate(provider, { 
        failureRedirect: ROUTES.LOGIN,
        failureMessage: true
    }, async (err, user, info) => {
        try {
            if (err || !user) {
                console.error(`${provider} authentication error:`, err || 'No user returned');
                return res.redirect(ROUTES.LOGIN);
            }

            await new Promise((resolve, reject) => {
                req.logIn(user, (err) => err ? reject(err) : resolve());
            });

            const token = generateToken(user);
            setAuthCookies(res, token);
            res.redirect(`${ROUTES.SUCCESS}`);

        } catch (error) {
            console.error(`Error in ${provider} callback:`, error);
            res.redirect(ROUTES.LOGIN);
        }
    })(req, res, next);
};

// OAuth Routes
router.get('/github', passport.authenticate('github'));
router.get('/github/callback', handleOAuthCallback('github'));

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    accessType: 'offline',
    prompt: 'consent'
}));
router.get('/google/callback', handleOAuthCallback('google'));

// Check authentication status
// router.get('/me', verifyToken, async (req, res) => {
//   try {
//       // الآن req.user يحتوي على بيانات المستخدم من قاعدة البيانات
//       // يمكننا الوصول إلى معلومات المستخدم من req.user مباشرة
//         const user = req.user
//       res.json({
//         success: true,
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           isVerified: user.isVerified
//         }
//       });
//     } catch (error) {
//       logger.error('Error in auth check:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Internal server error'
//       });
//     }
// });
module.exports = router;