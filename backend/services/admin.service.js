const { getAllUsersWithDetails, getUserByIdWithDetails } = require('../queries/admin.queries');

const listAllUsers = async ({ limit = 100, offset = 0 } = {}) => {
    const users = await getAllUsersWithDetails({ limit, offset });
    return { users, total: users.length };
};

const getUserDetails = async (userId) => {
    const user = await getUserByIdWithDetails(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
};

module.exports = { listAllUsers, getUserDetails };