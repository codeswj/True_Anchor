const { pool } = require('../config/db');

const getAccountByUserId = async (userId) => {
    const { rows } = await pool.query(
        `SELECT a.*, u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         WHERE a.user_id = $1`,
        [userId]
    );
    return rows[0] || null;
};

const getAccountById = async (accountId) => {
    const { rows } = await pool.query(
        `SELECT a.*, u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         WHERE a.id = $1`,
        [accountId]
    );
    return rows[0] || null;
};

const updateBalance = async (client, accountId, newBalance) => {
    const { rows } = await client.query(
        `UPDATE accounts SET balance=$1 WHERE id=$2 RETURNING *`,
        [newBalance, accountId]
    );
    return rows[0];
};

const updateShares = async (client, accountId, newShares) => {
    const { rows } = await client.query(
        `UPDATE accounts SET shares=$1 WHERE id=$2 RETURNING *`,
        [newShares, accountId]
    );
    return rows[0];
};

const getAllAccounts = async ({ limit = 20, offset = 0 }) => {
    const { rows } = await pool.query(
        `SELECT a.*, u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return rows;
};

module.exports = {
    getAccountByUserId,
    getAccountById,
    updateBalance,
    updateShares,
    getAllAccounts,
};
