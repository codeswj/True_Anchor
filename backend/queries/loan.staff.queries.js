const { pool } = require('../config/db');

// Get all loans with member details for staff view
const getAllLoans = async ({ status, search, limit = 100, offset = 0 } = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status && status !== 'all') {
        conditions.push(`l.status::text = $${idx++}`);
        params.push(status);
    }

    if (search) {
        conditions.push(`(u.full_name ILIKE $${idx} OR u.member_number ILIKE $${idx} OR l.loan_number ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows } = await pool.query(
        `SELECT
            l.id, l.loan_number, l.loan_type::text, l.principal_amount,
            l.interest_rate, l.loan_term_months, l.monthly_repayment,
            l.total_repayable, l.amount_paid, l.outstanding_balance,
            l.status::text, l.purpose,
            l.applied_at, l.approved_at, l.disbursed_at, l.due_date,
            l.completed_at, l.rejection_reason,
            u.id AS user_id, u.full_name AS member_name, u.phone AS member_phone,
            u.member_number,
            approver.full_name AS approved_by_name
         FROM loans l
         JOIN users u ON u.id = l.user_id
         LEFT JOIN users approver ON approver.id = l.approved_by
         ${whereClause}
         ORDER BY l.applied_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
    );
    return rows;
};

module.exports = { getAllLoans };