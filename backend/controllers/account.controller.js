const accountService     = require('../services/account.service');
const { success, error } = require('../utils/response');

const getMyAccount = async (req, res, next) => {
    try {
        const data = await accountService.getMyAccount(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getBalance = async (req, res, next) => {
    try {
        const data = await accountService.getBalance(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const listAccounts = async (req, res, next) => {
    try {
        const limit  = parseInt(req.query.limit)  || 20;
        const offset = parseInt(req.query.offset) || 0;
        const data   = await accountService.listAccounts({ limit, offset });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { getMyAccount, getBalance, listAccounts };
