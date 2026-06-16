const { pool } = require('../config/db');

// ── General (System-wide) Reports ──

const getSystemSummary = async () => {
    const { rows } = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'member') AS total_members,
            (SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'member') AS active_members,
            (SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE account_type = 'transactional') AS total_savings,
            (SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE account_type = 'shared') AS total_share_capital,
            (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed') AS total_deposits,
            (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'completed') AS total_withdrawals,
            (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'internal_transfer' AND status = 'completed') AS total_transfers,
            (SELECT COUNT(*) FROM loans WHERE status = 'active') AS active_loans,
            (SELECT COALESCE(SUM(principal_amount), 0) FROM loans) AS total_loans_disbursed,
            (SELECT COALESCE(SUM(outstanding_balance), 0) FROM loans WHERE status = 'active') AS outstanding_loan_balance
    `);
    return rows[0];
};

const getTransactionVolumeByDay = async ({ days = 30 } = {}) => {
    const { rows } = await pool.query(`
        SELECT
            DATE(created_at) AS date,
            COUNT(*) AS transaction_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            type
        FROM transactions
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
            AND status = 'completed'
        GROUP BY DATE(created_at), type
        ORDER BY date DESC, type
    `, [days]);
    return rows;
};

const getLoanStatsByType = async () => {
    const { rows } = await pool.query(`
        SELECT
            loan_type,
            COUNT(*) AS total_applied,
            COUNT(*) FILTER (WHERE status = 'approved') AS approved,
            COUNT(*) FILTER (WHERE status = 'active') AS active,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed,
            COUNT(*) FILTER (WHERE status = 'defaulted') AS defaulted,
            COALESCE(SUM(principal_amount), 0) AS total_principal,
            COALESCE(SUM(outstanding_balance), 0) AS total_outstanding
        FROM loans
        GROUP BY loan_type
        ORDER BY loan_type
    `);
    return rows;
};

const getTransactionSummaryByType = async () => {
    const { rows } = await pool.query(`
        SELECT
            type,
            COUNT(*) AS count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed_count
        FROM transactions
        GROUP BY type
        ORDER BY total_amount DESC
    `);
    return rows;
};

// ── Member-specific Reports ──

const getMemberReport = async (userId) => {
    const { rows } = await pool.query(`
        SELECT
            u.id, u.full_name, u.phone, u.email, u.member_number, u.id_number,
            u.is_active, u.created_at,
            COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'account_number', a.account_number,
                        'account_type', a.account_type::text,
                        'balance', a.balance,
                        'shares', a.shares
                    )
                ) FROM accounts a WHERE a.user_id = u.id),
                '[]'::json
            ) AS accounts,
            COALESCE(
                (SELECT
                    json_build_object(
                        'total_deposits', COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed'), 0),
                        'total_withdrawals', COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed'), 0),
                        'total_transfers', COALESCE(SUM(amount) FILTER (WHERE type = 'internal_transfer' AND status = 'completed'), 0),
                        'total_loan_repayments', COALESCE(SUM(amount) FILTER (WHERE type = 'loan_repayment' AND status = 'completed'), 0),
                        'total_savings_transfers', COALESCE(SUM(amount) FILTER (WHERE type = 'savings_transfer' AND status = 'completed'), 0),
                        'transaction_count', COUNT(*) FILTER (WHERE status = 'completed')
                    )
                FROM transactions WHERE user_id = u.id),
                '{}'::json
            ) AS transaction_summary,
            COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'loan_number', l.loan_number,
                        'loan_type', l.loan_type::text,
                        'principal_amount', l.principal_amount,
                        'outstanding_balance', l.outstanding_balance,
                        'status', l.status,
                        'applied_at', l.applied_at
                    )
                    ORDER BY l.applied_at DESC
                ) FROM loans l WHERE l.user_id = u.id),
                '[]'::json
            ) AS loans
        FROM users u
        WHERE u.id = $1
        GROUP BY u.id
    `, [userId]);
    return rows[0] || null;
};

const getAllMembersReport = async () => {
    const { rows } = await pool.query(`
        SELECT
            u.id, u.full_name, u.phone, u.member_number,
            u.is_active, u.created_at,
            COALESCE(
                (SELECT SUM(balance) FROM accounts WHERE user_id = u.id AND account_type = 'transactional'),
                0
            ) AS savings_balance,
            COALESCE(
                (SELECT SUM(balance) FROM accounts WHERE user_id = u.id AND account_type = 'shared'),
                0
            ) AS share_balance,
            COALESCE(
                (SELECT SUM(amount) FROM transactions WHERE user_id = u.id AND type = 'deposit' AND status = 'completed'),
                0
            ) AS total_deposited,
            COALESCE(
                (SELECT SUM(amount) FROM transactions WHERE user_id = u.id AND type = 'withdrawal' AND status = 'completed'),
                0
            ) AS total_withdrawn,
            COALESCE(
                (SELECT COUNT(*) FROM loans WHERE user_id = u.id AND status IN ('active', 'disbursed')),
                0
            ) AS active_loans_count
        FROM users u
        WHERE u.role = 'member'
        ORDER BY u.created_at DESC
    `);
    return rows;
};

module.exports = {
    getSystemSummary,
    getTransactionVolumeByDay,
    getLoanStatsByType,
    getTransactionSummaryByType,
    getMemberReport,
    getAllMembersReport,
};