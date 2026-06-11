const messageService     = require('../services/message.service');
const { success, error } = require('../utils/response');

const getMessages = async (req, res, next) => {
    try {
        const data = await messageService.getMessages(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getUnreadCount = async (req, res, next) => {
    try {
        const data = await messageService.getUnreadCount(req.user.id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const markRead = async (req, res, next) => {
    try {
        const data = await messageService.markRead(req.params.id, req.user.id);
        return success(res, data, 'Message marked as read');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const markAllRead = async (req, res, next) => {
    try {
        const data = await messageService.markAllRead(req.user.id);
        return success(res, data, 'All messages marked as read');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        await messageService.deleteMessage(req.params.id, req.user.id);
        return success(res, {}, 'Message deleted');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { getMessages, getUnreadCount, markRead, markAllRead, deleteMessage };
