const loanService        = require('../services/loan.service');
const { success, error } = require('../utils/response');

const applyLoan = async (req, res, next) => {
    try {
        const { loanType, principalAmount, loanTermMonths, purpose, guarantorIds } = req.body;
        if (!principalAmount || !loanTermMonths) return error(res, 'principalAmount and loanTermMonths are required', 400);
        const data = await loanService.applyLoan(req.user.id, { loanType, principalAmount, loanTermMonths, purpose, guarantorIds });
        return success(res, data, 'Loan application submitted', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getMyLoans = async (req, res, next) => {
    try {
        const data = await loanService.getMyLoans(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getLoanDetails = async (req, res, next) => {
    try {
        const data = await loanService.getLoanDetails(req.params.id);
        if (!data) return error(res, 'Loan not found', 404);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getMyLoanLimit = async (req, res, next) => {
    try {
        const limit = await loanService.getMyLoanLimit(req.user.id);
        return success(res, { loanLimit: limit });
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const repayLoan = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return error(res, 'Valid amount is required', 400);
        const data = await loanService.repayLoan(req.user.id, req.params.id, { amount });
        return success(res, data, 'Loan repayment successful');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const approveLoan = async (req, res, next) => {
    try {
        const data = await loanService.approveLoan(req.user.id, req.params.id);
        return success(res, data, 'Loan approved');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const rejectLoan = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const data = await loanService.rejectLoan(req.user.id, req.params.id, reason);
        return success(res, data, 'Loan rejected');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const disburseLoan = async (req, res, next) => {
    try {
        const data = await loanService.disburseLoan(req.user.id, req.params.id);
        return success(res, data, 'Loan disbursed');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const respondGuarantor = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['accepted','declined'].includes(status)) return error(res, 'status must be accepted or declined', 400);
        const data = await loanService.respondGuarantor(req.user.id, req.params.loanId, status);
        return success(res, data, `Guarantor request ${status}`);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getMyGuarantorRequests = async (req, res, next) => {
    try {
        const data = await loanService.getMyGuarantorRequests(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = {
    applyLoan, getMyLoans, getLoanDetails, getMyLoanLimit,
    repayLoan, approveLoan, rejectLoan, disburseLoan,
    respondGuarantor, getMyGuarantorRequests,
};
