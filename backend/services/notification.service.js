const { getSystemNotifications, getAdminNotifications } = require('../queries/notification.queries');

const getNotifications = async (userId, role) => {
    if (role === 'admin') {
        return getAdminNotifications({ limit: 100 });
    }
    return getSystemNotifications(userId, { limit: 50 });
};

module.exports = { getNotifications };