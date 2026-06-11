const { pool } = require('../config/db');

const createTransaction = async (client, {
    accountId, userId, type, amount,
    balanceBefore, balanceAfter, status,
    reference, description,
    recipientPhone, recipientName,
    bankName, bankAccount,
}) => {
    const { rows } = await client.query(
        `INSERT INTO transactions
            (account_id, user_id, type, amount, balance_before, balance_after,
             status, reference, description, recipient_phone, recipient_name,
             bank_name, bank_account)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
            accountId, userId, type, amount,
            balanceBefore, balanceAfter, status,
            reference, description || null,
            recipientPhone || null, recipientName || null,
            bankName || null, bankAccount || null,
        ]
    );
    return rows[0];
};

const getTransactionsByAccount = async (accountId, { limit = 20, offset = 0, type }) => {
    let query = `SELECT * FROM transactions WHERE account_id=$1`;
    const params = [accountId];
    if (type) { query += ` AND type=$${params.length + 1}`; params.push(type); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
};

const getTransactionByReference = async (reference) => {
    const { rows } = await pool.query(
        `SELECT * FROM transactions WHERE reference=$1`,
        [reference]
    );
    return rows[0] || null;
};

const updateTransactionStatus = async (client, id, status) => {
    const { rows } = await client.query(
        `UPDATE transactions SET status=$1 WHERE id=$2 RETURNING *`,
        [status, id]
    );
    return rows[0];
};

module.exports = {
    createTransaction,
    getTransactionsByAccount,
    getTransactionByReference,
    updateTransactionStatus,
};
