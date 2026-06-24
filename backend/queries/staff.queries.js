const { pool } = require('../config/db');

// Check for duplicate member by phone, id_number, or email
const findMemberByPhoneOrIdOrEmail = async (phone, idNumber, email) => {
    const conditions = ['phone = $1'];
    const params = [phone];
    let idx = 2;
    if (idNumber) {
        conditions.push(`id_number = $${idx++}`);
        params.push(idNumber);
    }
    if (email) {
        conditions.push(`email = $${idx++}`);
        params.push(email);
    }
    const { rows } = await pool.query(
        `SELECT id, phone, id_number, email FROM users WHERE ${conditions.join(' OR ')}`,
        params
    );
    return rows[0] || null;
};

// Get next member sequence number (based on user count)
const getNextMemberSequence = async (client = pool) => {
    const { rows } = await client.query('SELECT COUNT(*) AS total FROM users');
    return parseInt(rows[0].total) + 1;
};

// Create user + member_profile + 4 accounts in a single transaction
const onboardMember = async ({
    fullName,
    phone,
    pinHash,
    idNumber,
    email,
    memberNumber,
    kraPin,
    maritalStatus,
    dateOfBirth,
    gender,
    physicalAddress,
    signatureFilePath,
    passportPhotoFilePath,
}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const seq = await getNextMemberSequence(client);
        const suffix = String(seq).padStart(6, '0');

        // 1. Create user
        const { rows: userRows } = await client.query(
            `INSERT INTO users (full_name, phone, pin_hash, id_number, email, member_number)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, full_name, phone, id_number, email, member_number, role, is_active, created_at`,
            [fullName, phone, pinHash, idNumber || null, email || null, memberNumber]
        );
        const user = userRows[0];

        // 2. Create member profile
        await client.query(
            `INSERT INTO member_profiles
                (user_id, kra_pin, marital_status, date_of_birth, gender, physical_address, signature_file_path, passport_photo_file_path)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                user.id,
                kraPin || null,
                maritalStatus || null,
                dateOfBirth || null,
                gender || null,
                physicalAddress || null,
                signatureFilePath || null,
                passportPhotoFilePath || null,
            ]
        );

        // 3. Create 4 sub-accounts: shares, transactional, loans, savings
        const { rows: accountRows } = await client.query(
            `INSERT INTO accounts (user_id, account_number, account_type)
             VALUES
                ($1, $2, 'shared'),
                ($1, $3, 'transactional'),
                ($1, $4, 'loans'),
                ($1, $5, 'savings')
             RETURNING id, account_number, account_type, balance, shares, is_active, created_at`,
            [user.id, `SHR-${suffix}`, `TXN-${suffix}`, `LON-${suffix}`, `SAV-${suffix}`]
        );

        await client.query('COMMIT');

        return { user, accounts: accountRows };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// List all members (role = 'member') with their accounts
const listMembersWithAccounts = async ({ limit = 100, offset = 0, status } = {}) => {
    let statusFilter = '';
    const params = [];
    if (status && status !== 'all') {
        if (status === 'active') {
            statusFilter = 'WHERE u.is_active = true';
        } else if (status === 'inactive') {
            statusFilter = 'WHERE u.is_active = false';
        }
    }
    params.push(limit, offset);

    const { rows } = await pool.query(
        `SELECT
            u.id, u.full_name, u.phone, u.email, u.id_number, u.member_number,
            u.role, u.is_active, u.created_at
         FROM users u
         ${statusFilter}
         ORDER BY u.created_at DESC
         LIMIT $1 OFFSET $2`,
        params
    );

    if (rows.length > 0) {
        const userIds = rows.map((r) => r.id);
        const { rows: accountRows } = await pool.query(
            `SELECT
                a.id, a.user_id, a.account_number, a.account_type::text, a.balance, a.shares, a.is_active
             FROM accounts a
             WHERE a.user_id = ANY($1::uuid[])
             ORDER BY
                CASE a.account_type::text
                    WHEN 'shared' THEN 1
                    WHEN 'transactional' THEN 2
                    WHEN 'savings' THEN 3
                    WHEN 'loans' THEN 4
                    WHEN 'backoffice' THEN 5
                    ELSE 6
                END`,
            [userIds]
        );

        const accountMap = {};
        accountRows.forEach((a) => {
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

        rows.forEach((u) => {
            u.accounts = accountMap[u.id] || [];
        });
    }

    return rows;
};

// Get a single member with profile + accounts
const getMemberWithDetails = async (userId) => {
    const { rows } = await pool.query(
        `SELECT
            u.id, u.full_name, u.phone, u.email, u.id_number, u.member_number,
            u.role, u.is_active, u.created_at,
            mp.kra_pin, mp.marital_status, mp.date_of_birth, mp.gender,
            mp.physical_address, mp.signature_file_path, mp.passport_photo_file_path
         FROM users u
         LEFT JOIN member_profiles mp ON mp.user_id = u.id
         WHERE u.id = $1`,
        [userId]
    );

    if (rows.length === 0) return null;

    const member = rows[0];

    const { rows: accountRows } = await pool.query(
        `SELECT
            a.id, a.account_number, a.account_type::text, a.balance, a.shares, a.is_active, a.created_at
         FROM accounts a
         WHERE a.user_id = $1
         ORDER BY
            CASE a.account_type::text
                WHEN 'shared' THEN 1
                WHEN 'transactional' THEN 2
                WHEN 'savings' THEN 3
                WHEN 'loans' THEN 4
                WHEN 'backoffice' THEN 5
                ELSE 6
            END`,
        [userId]
    );

    member.accounts = accountRows.map((a) => ({
        id: a.id,
        account_number: a.account_number,
        account_type: a.account_type,
        balance: a.balance,
        shares: a.shares,
        is_active: a.is_active,
        created_at: a.created_at,
    }));

    return member;
};

module.exports = {
    findMemberByPhoneOrIdOrEmail,
    getNextMemberSequence,
    onboardMember,
    listMembersWithAccounts,
    getMemberWithDetails,
};