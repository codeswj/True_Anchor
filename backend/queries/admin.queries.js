const { pool } = require('../config/db');

const getAllUsersWithDetails = async ({ limit = 100, offset = 0 } = {}) => {
    const { rows } = await pool.query(
        `SELECT
            u.id,
            u.full_name,
            u.phone,
            u.email,
            u.id_number,
            u.member_number,
            u.role,
            u.is_active,
            u.created_at,
            u.updated_at
         FROM users u
         ORDER BY u.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    // Fetch accounts for all users
    if (rows.length > 0) {
        const userIds = rows.map(r => r.id);
        const { rows: accountRows } = await pool.query(
            `SELECT
                a.id, a.user_id, a.account_number, a.account_type::text, a.balance, a.shares, a.is_active
             FROM accounts a
             WHERE a.user_id = ANY($1::uuid[])
             ORDER BY
                CASE a.account_type::text
                    WHEN 'shared' THEN 1
                    WHEN 'transactional' THEN 2
                    WHEN 'backoffice' THEN 3
                    ELSE 4
                END`,
            [userIds]
        );

        // Fetch recent transactions for all users
        const { rows: txnRows } = await pool.query(
            `SELECT
                t.id, t.user_id, t.type, t.amount, t.status, t.reference, t.description, t.created_at,
                ROW_NUMBER() OVER (PARTITION BY t.user_id ORDER BY t.created_at DESC) AS rn
             FROM transactions t
             WHERE t.user_id = ANY($1::uuid[])`,
            [userIds]
        );

        // Map accounts and transactions to users
        const accountMap = {};
        const txnMap = {};
        accountRows.forEach(a => {
            if (!accountMap[a.user_id]) accountMap[a.user_id] = [];
            accountMap[a.user_id].push({
                id: a.id,
                account_number: a.account_number,
                account_type: a.account_type,
                balance: a.balance,
                shares: a.shares,
                is_active: a.is_active,
            });
        });
        txnRows.forEach(t => {
            if (!txnMap[t.user_id]) txnMap[t.user_id] = [];
            if (txnMap[t.user_id].length < 5) {
                txnMap[t.user_id].push({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    status: t.status,
                    reference: t.reference,
                    description: t.description,
                    created_at: t.created_at,
                });
            }
        });

        rows.forEach(u => {
            u.accounts = accountMap[u.id] || [];
            u.recent_transactions = txnMap[u.id] || [];
        });
    }

    return rows;
};

const getUserByIdWithDetails = async (userId) => {
    const { rows } = await pool.query(
        `SELECT
            u.id,
            u.full_name,
            u.phone,
            u.email,
            u.id_number,
            u.member_number,
            u.role,
            u.is_active,
            u.created_at,
            u.updated_at
         FROM users u
         WHERE u.id = $1`,
        [userId]
    );

    if (rows.length === 0) return null;

    const user = rows[0];

    // Fetch accounts
    const { rows: accountRows } = await pool.query(
        `SELECT
            a.id, a.user_id, a.account_number, a.account_type::text, a.balance, a.shares, a.is_active
         FROM accounts a
         WHERE a.user_id = $1
         ORDER BY
            CASE a.account_type::text
                WHEN 'shared' THEN 1
                WHEN 'transactional' THEN 2
                WHEN 'backoffice' THEN 3
                ELSE 4
            END`,
        [userId]
    );

    // Fetch recent transactions
    const { rows: txnRows } = await pool.query(
        `SELECT
            t.id, t.type, t.amount, t.status, t.reference, t.description, t.created_at
         FROM transactions t
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT 10`,
        [userId]
    );

    user.accounts = accountRows.map(a => ({
        id: a.id,
        account_number: a.account_number,
        account_type: a.account_type,
        balance: a.balance,
        shares: a.shares,
        is_active: a.is_active,
    }));
    user.recent_transactions = txnRows.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        reference: t.reference,
        description: t.description,
        created_at: t.created_at,
    }));

    return user;
};

module.exports = { getAllUsersWithDetails, getUserByIdWithDetails };