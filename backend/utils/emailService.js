const nodemailer = require('nodemailer');

// إنشاء قالب البريد الإلكتروني
function createEmailTemplate(title, message1, message2, buttonText, buttonUrl) {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">${title}</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: right;">
                ${message1}
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: right;">
                ${message2}
            </p>
            <div style="text-align: center;">
                <a href="${buttonUrl}" 
                   style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    ${buttonText}
                </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: right;">
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
            </p>
        </div>
    </body>
    </html>
    `;
}

// إنشاء ناقل البريد الإلكتروني باستخدام SMTP
function createTransporter() {
    try {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_PORT === '465', // صحيح إذا كان المنفذ 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } catch (error) {
        console.error('Error creating transporter:', error);
        throw error;
    }
}

// إرسال بريد التحقق
async function sendVerificationEmail(email, verificationToken) {
    try {
        console.log('Starting to send verification email to:', email);
        
        const transporter = createTransporter();
        const verificationUrl = `${process.env.APP_URL}/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: `"خدمة الكتب" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'تأكيد البريد الإلكتروني',
            html: createEmailTemplate(
                'تأكيد البريد الإلكتروني',
                'شكراً لتسجيلك! يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني.',
                '',
                'تأكيد البريد الإلكتروني',
                verificationUrl
            )
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', result.messageId);
        
        return result;
    } catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        throw error;
    }
}

// إرسال بريد إعادة تعيين كلمة المرور
async function sendResetPasswordEmail(email, resetToken) {
    try {
        const transporter = createTransporter();

        // تأكد من أن APP_URL صحيح (مثال: http://localhost:3000)
        const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
        
        console.log('Reset URL:', resetUrl); // للتحقق من الرابط

        const mailOptions = {
            from: `"خدمة الكتب" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'إعادة تعيين كلمة المرور',
            html: createEmailTemplate(
                'إعادة تعيين كلمة المرور',
                'لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.',
                'انقر على الزر أدناه لإعادة تعيين كلمة المرور. هذا الرابط صالح لمدة 5 دقائق فقط.',
                'إعادة تعيين كلمة المرور',
                resetUrl
            )
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully:', info.messageId);
        
        return info;
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw error;
    }
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };