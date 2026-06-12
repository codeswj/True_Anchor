const { pool } = require('../config/db');

const findUserByPhone = async (phone) => {
    const { rows } = await pool.query(
        `SELECT u.*, a.id AS account_id, a.account_number, a.balance
         FROM users u
         LEFT JOIN accounts a ON a.user_id = u.id AND a.account_type = 'transactional'
         WHERE u.phone = $1`,
        [phone]
    );
    return rows[0] || null;
};

const findUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT u.*, a.id AS account_id, a.account_number, a.balance
         FROM users u
         LEFT JOIN accounts a ON a.user_id = u.id AND a.account_type = 'transactional'
         WHERE u.id = $1`,
        [id]
    );
    return rows[0] || null;
};

const createUser = async ({ fullName, phone, pinHash, idNumber, email, memberNumber }) => {
    const { rows } = await pool.query(
        `INSERT INTO users (full_name, phone, pin_hash, id_number, email, member_number)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, full_name, phone, id_number, email, member_number, role, is_active, created_at`,
        [fullName, phone, pinHash, idNumber || null, email || null, memberNumber]
    );
    return rows[0];
};

const createAccount = async (userId, accountNumber) => {
    const { rows } = await pool.query(
        `INSERT INTO accounts (user_id, account_number, account_type)
         VALUES ($1,$2,'transactional')
         RETURNING *`,
        [userId, accountNumber]
    );
    return rows[0];
};

const createMemberAccounts = async (userId, sequence) => {
    const suffix = String(sequence).padStart(6, '0');
    const { rows } = await pool.query(
        `INSERT INTO accounts (user_id, account_number, account_type)
         VALUES
            ($1, $2, 'shared'),
            ($1, $3, 'transactional'),
            ($1, $4, 'backoffice')
         RETURNING *`,
        [userId, `SHR-${suffix}`, `TXN-${suffix}`, `BOF-${suffix}`]
    );
    return rows;
};

const getNextSequence = async (table, column) => {
    const { rows } = await pool.query(
        `SELECT COUNT(*) AS total FROM ${table}`
    );
    return parseInt(rows[0].total) + 1;
};

const updatePin = async (userId, pinHash) => {
    await pool.query(
        `UPDATE users SET pin_hash=$1 WHERE id=$2`,
        [pinHash, userId]
    );
};

module.exports = {
    findUserByPhone,
    findUserById,
    createUser,
    createAccount,
    createMemberAccounts,
    getNextSequence,
    updatePin,
};
