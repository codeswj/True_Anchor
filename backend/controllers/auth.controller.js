const authService    = require('../services/auth.service');
const { success, error } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const { fullName, phone, pin, idNumber, email } = req.body;
        if (!fullName || !phone || !pin) return error(res, 'fullName, phone and pin are required', 400);
        if (pin.length < 4)             return error(res, 'PIN must be at least 4 digits', 400);
        const data = await authService.register({ fullName, phone, pin, idNumber, email });
        return success(res, data, 'Registration successful', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { phone, pin } = req.body;
        if (!phone || !pin) return error(res, 'Phone and PIN are required', 400);
        const data = await authService.login({ phone, pin });
        return success(res, data, 'Login successful');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const data = await authService.getProfile(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const changePin = async (req, res, next) => {
    try {
        const { oldPin, newPin } = req.body;
        if (!oldPin || !newPin) return error(res, 'oldPin and newPin are required', 400);
        if (newPin.length < 4)  return error(res, 'New PIN must be at least 4 digits', 400);
        await authService.changePin(req.user.id, { oldPin, newPin });
        return success(res, {}, 'PIN changed successfully');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { register, login, getProfile, changePin };
