const notificationService = require('../services/notification.service');
const { success, error } = require('../utils/response');

const listNotifications = async (req, res, next) => {
    try {
        const data = await notificationService.getNotifications(req.user.id, req.user.role);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { listNotifications };