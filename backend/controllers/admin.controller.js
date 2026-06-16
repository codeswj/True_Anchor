const adminService    = require('../services/admin.service');
const { success, error } = require('../utils/response');

const listUsers = async (req, res, next) => {
    try {
        const limit  = parseInt(req.query.limit)  || 100;
        const offset = parseInt(req.query.offset) || 0;
        const data   = await adminService.listAllUsers({ limit, offset });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data   = await adminService.getUserDetails(id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { listUsers, getUser };