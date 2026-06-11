const txnService         = require('../services/transaction.service');
const { success, error } = require('../utils/response');

const deposit = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        if (!amount || amount <= 0) return error(res, 'Valid amount is required', 400);
        const data = await txnService.deposit(req.user.id, { amount, description });
        return success(res, data, 'Deposit successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const withdraw = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        if (!amount || amount <= 0) return error(res, 'Valid amount is required', 400);
        const data = await txnService.withdraw(req.user.id, { amount, description });
        return success(res, data, 'Withdrawal successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const bankTransfer = async (req, res, next) => {
    try {
        const { amount, bankName, bankAccount, description } = req.body;
        if (!amount || !bankName || !bankAccount) return error(res, 'amount, bankName and bankAccount are required', 400);
        const data = await txnService.bankTransfer(req.user.id, { amount, bankName, bankAccount, description });
        return success(res, data, 'Bank transfer successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const mobileMoneyTransfer = async (req, res, next) => {
    try {
        const { amount, recipientPhone, description } = req.body;
        if (!amount || !recipientPhone) return error(res, 'amount and recipientPhone are required', 400);
        const data = await txnService.mobileMoneyTransfer(req.user.id, { amount, recipientPhone, description });
        return success(res, data, 'Mobile money transfer successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const savingsTransfer = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        if (!amount || amount <= 0) return error(res, 'Valid amount is required', 400);
        const data = await txnService.savingsTransfer(req.user.id, { amount, description });
        return success(res, data, 'Savings transfer successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const buyAirtime = async (req, res, next) => {
    try {
        const { amount, recipientPhone } = req.body;
        if (!amount || !recipientPhone) return error(res, 'amount and recipientPhone are required', 400);
        const data = await txnService.buyAirtime(req.user.id, { amount, recipientPhone });
        return success(res, data, 'Airtime purchased successfully', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const payUtility = async (req, res, next) => {
    try {
        const { amount, description, recipientName, recipientPhone } = req.body;
        if (!amount || !description) return error(res, 'amount and description are required', 400);
        const data = await txnService.payUtility(req.user.id, { amount, description, recipientName, recipientPhone });
        return success(res, data, 'Utility payment successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getStatement = async (req, res, next) => {
    try {
        const limit  = parseInt(req.query.limit)  || 20;
        const offset = parseInt(req.query.offset) || 0;
        const type   = req.query.type || null;
        const data   = await txnService.getStatement(req.user.id, { limit, offset, type });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { deposit, withdraw, bankTransfer, mobileMoneyTransfer, savingsTransfer, buyAirtime, payUtility, getStatement };
