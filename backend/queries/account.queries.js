const { pool } = require('../config/db');

const getAccountByUserId = async (userId, accountType = 'transactional') => {
    const { rows } = await pool.query(
        `SELECT
            a.id, a.user_id, a.account_number, a.account_type, a.balance, a.shares, a.is_active,
            a.created_at, a.updated_at,
            u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         WHERE a.user_id = $1
           AND a.account_type = $2`,
        [userId, accountType]
    );
    return rows[0] || null;
};

const getAccountsByUserId = async (userId) => {
    const { rows } = await pool.query(
        `SELECT
            a.id, a.user_id, a.account_number, a.account_type, a.balance, a.shares, a.is_active,
            a.created_at, a.updated_at,
            u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         WHERE a.user_id = $1
         ORDER BY
            CASE a.account_type
                WHEN 'shared' THEN 1
                WHEN 'transactional' THEN 2
                WHEN 'savings' THEN 3
                WHEN 'loans' THEN 4
                ELSE 5
            END`,
        [userId]
    );
    return rows;
};

const getAccountById = async (accountId) => {
    const { rows } = await pool.query(
        `SELECT
            a.id, a.user_id, a.account_number, a.account_type, a.balance, a.shares, a.is_active,
            a.created_at, a.updated_at,
            u.full_name, u.phone, u.member_number
         FROM accounts a
         JOIN users u ON u.id = a.user_id
         WHERE a.id = $1`,
        [accountId]
    );
    return rows[0] || null;
};

const updateBalance = async (client, accountId, newBalance) => {
    const { rows } = await client.query(
        `UPDATE accounts SET balance=$1 WHERE id=$2
         RETURNING id, user_id, account_number, account_type, balance, shares, is_active`,
        [newBalance, accountId]
    );
    return rows[0];
};

const updateShares = async (client, accountId, newShares) => {
    const { rows } = await client.query(
        `UPDATE accounts SET shares=$1 WHERE id=$2
         RETURNING id, user_id, account_number, account_type, balance, shares, is_active`,
        [newShares, accountId]
    );
    return rows[0];
};

const getAllAccounts = async ({ limit = 20, offset = 0 }) => {
    const { rows } = await pool.query(
        `SELECT
            a.id, a.user_id, a.account_number, a.account_type, a.balance, a.shares, a.is_active,
            a.created_at,
            u.full_name, u.phone, u.member_number
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
    getAccountsByUserId,
    getAccountById,
    updateBalance,
    updateShares,
    getAllAccounts,
};
