const { pool } = require('../config/db');

const getMessagesByUser = async (userId, limit = 50) => {
    const { rows } = await pool.query(
        `SELECT * FROM messages
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return rows;
};

const getUnreadCount = async (userId) => {
    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM messages
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return rows[0].count;
};

const markMessageRead = async (messageId, userId) => {
    const { rows } = await pool.query(
        `UPDATE messages SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [messageId, userId]
    );
    return rows[0] || null;
};

const markAllMessagesRead = async (userId) => {
    const { rowCount } = await pool.query(
        `UPDATE messages SET is_read = true
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return rowCount;
};

const createMessage = async (client, { userId, title, body }) => {
    const { rows } = await pool.query(
        `INSERT INTO messages (user_id, title, body)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, title, body]
    );
    return rows[0];
};

const deleteMessage = async (messageId, userId) => {
    const { rowCount } = await pool.query(
        `DELETE FROM messages WHERE id = $1 AND user_id = $2`,
        [messageId, userId]
    );
    return rowCount > 0;
};

module.exports = {
    getMessagesByUser,
    getUnreadCount,
    markMessageRead,
    markAllMessagesRead,
    createMessage,
    deleteMessage,
};
