const jwt    = require('jsonwebtoken');
const jwtCfg = require('../config/jwt');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtCfg.secret);
        req.user = decoded;
        next();
    } catch (err) {
        return error(res, 'Invalid or expired token', 401);
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return error(res, 'Admin access required', 403);
    }
    next();
};

const authorizeStaff = (req, res, next) => {
    if (!['staff', 'admin'].includes(req.user?.role)) {
        return error(res, 'Staff access required', 403);
    }
    next();
};

module.exports = { authenticate, authorizeAdmin, authorizeStaff };
