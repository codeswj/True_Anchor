const { pool } = require('../config/db');

const getSystemNotifications = async (userId, { limit = 50 } = {}) => {
    const { rows } = await pool.query(`
        -- Personal messages
        SELECT
            m.id,
            'message' AS notification_type,
            m.title,
            m.body AS description,
            m.is_read,
            m.created_at,
            NULL::uuid AS related_user_id,
            NULL::text AS related_user_name
        FROM messages m
        WHERE m.user_id = $1

        UNION ALL

        -- Recent transactions (for own activity)
        SELECT
            t.id::text,
            'transaction' AS notification_type,
            CASE t.type::text
                WHEN 'deposit' THEN 'Deposit Received'
                WHEN 'withdrawal' THEN 'Withdrawal Processed'
                WHEN 'internal_transfer' THEN 'Transfer Sent'
                WHEN 'savings_transfer' THEN 'Savings Transfer'
                WHEN 'loan_disbursement' THEN 'Loan Disbursed'
                WHEN 'loan_repayment' THEN 'Loan Repayment'
                WHEN 'airtime' THEN 'Airtime Purchase'
                WHEN 'utility_payment' THEN 'Utility Payment'
                WHEN 'bank_transfer' THEN 'Bank Transfer'
                ELSE 'Transaction'
            END AS title,
            CONCAT(
                UPPER(SUBSTRING(t.type::text FROM 1 FOR 1)), SUBSTRING(t.type::text FROM 2),
                ' of KES ', t.amount::text,
                CASE WHEN t.status::text = 'completed' THEN ' - Successful' ELSE ' - ' || t.status::text END
            ) AS description,
            true AS is_read,
            t.created_at,
            NULL::uuid AS related_user_id,
            NULL::text AS related_user_name
        FROM transactions t
        WHERE t.user_id = $1
          AND t.status::text IN ('completed', 'failed')

        UNION ALL

        -- Loan activity
        SELECT
            l.id::text,
            'loan' AS notification_type,
            CASE l.status::text
                WHEN 'pending' THEN 'Loan Application Submitted'
                WHEN 'approved' THEN 'Loan Approved'
                WHEN 'rejected' THEN 'Loan Rejected'
                WHEN 'disbursed' THEN 'Loan Disbursed'
                WHEN 'active' THEN 'Loan Payment Reminder'
                WHEN 'completed' THEN 'Loan Completed'
                WHEN 'defaulted' THEN 'Loan Default Notice'
                ELSE 'Loan Update'
            END AS title,
            CONCAT(
                'Loan ', l.loan_number, ' - ', l.loan_type::text,
                ' (KES ', l.principal_amount, ') - Status: ', l.status::text
            ) AS description,
            true AS is_read,
            l.applied_at AS created_at,
            NULL::uuid AS related_user_id,
            NULL::text AS related_user_name
        FROM loans l
        WHERE l.user_id = $1

        ORDER BY created_at DESC
        LIMIT $2
    `, [userId, limit]);
    return rows;
};

const getAdminNotifications = async ({ limit = 100 } = {}) => {
    const { rows } = await pool.query(`
        -- New member registrations (who onboarded them)
        SELECT
            u.id::text AS id,
            'member_registration' AS notification_type,
            'New Member Registered' AS title,
            CONCAT(u.full_name, ' (', u.phone, ') joined as ', u.member_number) AS description,
            u.created_at,
            u.id AS related_user_id,
            u.full_name AS related_user_name,
            NULL::text AS performed_by_name
        FROM users u
        WHERE u.role = 'member'

        UNION ALL

        -- Recent transactions (who performed them)
        SELECT
            t.id::text,
            'transaction' AS notification_type,
            CONCAT(UPPER(SUBSTRING(t.type::text FROM 1 FOR 1)), SUBSTRING(t.type::text FROM 2)) AS title,
            CONCAT(
                u.full_name, ' - KES ', t.amount::text,
                ' (', t.status::text, ')'
            ) AS description,
            t.created_at,
            u.id AS related_user_id,
            u.full_name AS related_user_name,
            NULL::text AS performed_by_name
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE t.status::text IN ('completed', 'failed')

        UNION ALL

        -- Loan applications and status changes
        SELECT
            l.id::text,
            'loan' AS notification_type,
            CONCAT('Loan ', l.status::text) AS title,
            CONCAT(
                u.full_name, ' - ', l.loan_type::text,
                ' KES ', l.principal_amount::text,
                ' (', l.status::text, ')'
            ) AS description,
            COALESCE(l.updated_at, l.applied_at) AS created_at,
            u.id AS related_user_id,
            u.full_name AS related_user_name,
            CONCAT(approver.full_name) AS performed_by_name
        FROM loans l
        JOIN users u ON u.id = l.user_id
        LEFT JOIN users approver ON approver.id = l.approved_by

        UNION ALL

        -- System messages sent to any user
        SELECT
            m.id::text,
            'system_message' AS notification_type,
            m.title,
            CONCAT('To: ', u.full_name, ' - ', m.body) AS description,
            m.created_at,
            u.id AS related_user_id,
            u.full_name AS related_user_name,
            NULL::text AS performed_by_name
        FROM messages m
        JOIN users u ON u.id = m.user_id

        UNION ALL

        -- Vendor activities (new vendor created)
        SELECT
            v.id::text || '-created' AS id,
            'vendor' AS notification_type,
            'Vendor Added' AS title,
            CONCAT('Vendor "', v.vendor_name, '" (', v.vendor_number, ') registered - Phone: ', v.phone) AS description,
            v.created_at,
            v.created_by AS related_user_id,
            creator.full_name AS related_user_name,
            creator.full_name AS performed_by_name
        FROM vendors v
        LEFT JOIN users creator ON creator.id = v.created_by

        UNION ALL

        -- Vendor activities (vendor details updated)
        SELECT
            v.id::text || '-updated' AS id,
            'vendor' AS notification_type,
            'Vendor Updated' AS title,
            CONCAT('Vendor "', v.vendor_name, '" (', v.vendor_number, ') details were updated') AS description,
            v.updated_at,
            v.created_by AS related_user_id,
            creator.full_name AS related_user_name,
            creator.full_name AS performed_by_name
        FROM vendors v
        LEFT JOIN users creator ON creator.id = v.created_by
        WHERE v.updated_at > v.created_at

        ORDER BY created_at DESC
        LIMIT $1
    `, [limit]);
    return rows;
};

module.exports = { getSystemNotifications, getAdminNotifications, getAllActivities: getAdminNotifications };
