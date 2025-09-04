const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Role = require('./models/Role');

const authenticateUser = async (req, res, next) => {
   const token = req.cookies.token;  // هنا نأخذ التوكن من الكوكيز
  if (!token) return res.status(401).json({ message: 'Unauthorized - No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('role'); // Populate the role
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized - Access token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

const authorizeRole = (requiredRole) => (req, res, next) => {
    // Allow superadmin to access any role-restricted route
    if (req.user.role && req.user.role.name === 'superadmin') {
        return next();
    }
    if (!req.user.role || req.user.role.name !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden - Insufficient role' });
    }
    next();
};

const authorizePermission = (requiredPermission) => (req, res, next) => {
    if (!req.user.role || !req.user.role.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
    next();
};

module.exports = { authenticateUser, authorizeRole, authorizePermission };