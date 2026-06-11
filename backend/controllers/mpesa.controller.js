const mpesaService       = require('../services/mpesa.service');
const { success, error } = require('../utils/response');

const stkPush = async (req, res, next) => {
    try {
        const { phone, amount, description } = req.body;
        if (!phone || !amount) return error(res, 'phone and amount are required', 400);
        if (amount < 1)        return error(res, 'Minimum amount is KES 1', 400);
        const data = await mpesaService.initiateSTKPush(req.user.id, { phone, amount, description });
        return success(res, data, 'STK push initiated. Enter PIN on your phone.');
    } catch (err) {
        console.error('STK Push error:', err);
        // If axios error, surface remote response for easier debugging
        if (err.response) {
            console.error('MPESA response error data:', err.response.data);
        }
        if (err.statusCode) return error(res, err.message, err.statusCode);
        return error(res, 'Internal server error initiating STK push', 500);
    }
};

// Called by Safaricom — no auth middleware
const callback = async (req, res) => {
    try {
        await mpesaService.handleCallback(req.body);
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (err) {
        console.error('M-Pesa callback error:', err.message);
        res.json({ ResultCode: 0, ResultDesc: 'Received' }); // Always ack Safaricom
    }
};

const checkStatus = async (req, res, next) => {
    try {
        const data = await mpesaService.checkStatus(req.params.checkoutRequestId);
        if (!data) return error(res, 'Transaction not found', 404);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { stkPush, callback, checkStatus };
