const messageQ = require('../queries/message.queries');

const getMessages = async (userId) => {
    return messageQ.getMessagesByUser(userId);
};

const getUnreadCount = async (userId) => {
    const count = await messageQ.getUnreadCount(userId);
    return { count };
};

const markRead = async (messageId, userId) => {
    const msg = await messageQ.markMessageRead(messageId, userId);
    if (!msg) throw { statusCode: 404, message: 'Message not found' };
    return msg;
};

const markAllRead = async (userId) => {
    const updated = await messageQ.markAllMessagesRead(userId);
    return { updated };
};

const sendMessage = async ({ userId, title, body }) => {
    return messageQ.createMessage(null, { userId, title, body });
};

const deleteMessage = async (messageId, userId) => {
    const deleted = await messageQ.deleteMessage(messageId, userId);
    if (!deleted) throw { statusCode: 404, message: 'Message not found' };
};

module.exports = {
    getMessages,
    getUnreadCount,
    markRead,
    markAllRead,
    sendMessage,
    deleteMessage,
};
