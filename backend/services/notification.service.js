const { getSystemNotifications, getAllActivities } = require('../queries/notification.queries');

const getNotifications = async (userId, role) => {
    // Both admin and staff see all system activities
    if (role === 'admin' || role === 'staff') {
        return getAllActivities({ limit: 200 });
    }
    // Regular members see only their own notifications
    return getSystemNotifications(userId, { limit: 50 });
};

module.exports = { getNotifications };
