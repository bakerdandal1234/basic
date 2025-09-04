const cors = require('cors');

// إعدادات CORS
const corsOptions = {
    origin: process.env.APP_URL || 'http://localhost:5173',
    credentials: true,
};

// تصدير middleware الـ CORS
module.exports = cors(corsOptions);