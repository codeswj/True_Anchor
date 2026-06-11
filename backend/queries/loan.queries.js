const { pool } = require('../config/db');

const createLoan = async (client, {
    userId, accountId, loanNumber, loanType,
    principalAmount, interestRate, loanTermMonths,
    monthlyRepayment, totalRepayable, purpose,
}) => {
    const { rows } = await client.query(
        `INSERT INTO loans
            (user_id, account_id, loan_number, loan_type, principal_amount,
             interest_rate, loan_term_months, monthly_repayment,
             total_repayable, outstanding_balance, purpose)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [
            userId, accountId, loanNumber, loanType,
            principalAmount, interestRate, loanTermMonths,
            monthlyRepayment, totalRepayable, totalRepayable, purpose || null,
        ]
    );
    return rows[0];
};

const getLoansByUser = async (userId) => {
    const { rows } = await pool.query(
        `SELECT l.*,
                COUNT(lg.id)::int AS guarantor_count
         FROM loans l
         LEFT JOIN loan_guarantors lg ON lg.loan_id = l.id
         WHERE l.user_id = $1
         GROUP BY l.id
         ORDER BY l.applied_at DESC`,
        [userId]
    );
    return rows;
};

const getLoanById = async (loanId) => {
    const { rows } = await pool.query(
        `SELECT l.*,
                u.full_name, u.phone, u.member_number,
                json_agg(
                    json_build_object(
                        'id', lg.id,
                        'guarantor_id', lg.guarantor_id,
                        'full_name', gu.full_name,
                        'phone', gu.phone,
                        'amount_guaranteed', lg.amount_guaranteed,
                        'status', lg.status
                    )
                ) FILTER (WHERE lg.id IS NOT NULL) AS guarantors
         FROM loans l
         JOIN users u ON u.id = l.user_id
         LEFT JOIN loan_guarantors lg ON lg.loan_id = l.id
         LEFT JOIN users gu ON gu.id = lg.guarantor_id
         WHERE l.id = $1
         GROUP BY l.id, u.full_name, u.phone, u.member_number`,
        [loanId]
    );
    return rows[0] || null;
};

const updateLoanStatus = async (client, loanId, status, extra = {}) => {
    const setClauses = ['status = $2'];
    const params = [loanId, status];
    let idx = 3;

    if (extra.approvedBy)      { setClauses.push(`approved_by=$${idx++}`);      params.push(extra.approvedBy); }
    if (extra.approvedAt)      { setClauses.push(`approved_at=$${idx++}`);      params.push(extra.approvedAt); }
    if (extra.disbursedAt)     { setClauses.push(`disbursed_at=$${idx++}`);     params.push(extra.disbursedAt); }
    if (extra.dueDate)         { setClauses.push(`due_date=$${idx++}`);         params.push(extra.dueDate); }
    if (extra.completedAt)     { setClauses.push(`completed_at=$${idx++}`);     params.push(extra.completedAt); }
    if (extra.rejectionReason) { setClauses.push(`rejection_reason=$${idx++}`); params.push(extra.rejectionReason); }

    const { rows } = await client.query(
        `UPDATE loans SET ${setClauses.join(',')} WHERE id=$1 RETURNING *`,
        params
    );
    return rows[0];
};

const recordRepayment = async (client, loanId, amount) => {
    const { rows } = await client.query(
        `UPDATE loans
         SET amount_paid         = amount_paid + $2,
             outstanding_balance = outstanding_balance - $2
         WHERE id = $1
         RETURNING *`,
        [loanId, amount]
    );
    return rows[0];
};

const addGuarantor = async (client, { loanId, guarantorId, amountGuaranteed }) => {
    const { rows } = await client.query(
        `INSERT INTO loan_guarantors (loan_id, guarantor_id, amount_guaranteed)
         VALUES ($1,$2,$3)
         ON CONFLICT (loan_id, guarantor_id) DO NOTHING
         RETURNING *`,
        [loanId, guarantorId, amountGuaranteed]
    );
    return rows[0];
};

const respondToGuarantor = async (guarantorId, loanId, status) => {
    const { rows } = await pool.query(
        `UPDATE loan_guarantors
         SET status=$3, responded_at=NOW()
         WHERE guarantor_id=$1 AND loan_id=$2
         RETURNING *`,
        [guarantorId, loanId, status]
    );
    return rows[0];
};

const getGuarantorRequests = async (guarantorId) => {
    const { rows } = await pool.query(
        `SELECT lg.*, l.loan_number, l.principal_amount, l.loan_type,
                u.full_name AS borrower_name, u.phone AS borrower_phone
         FROM loan_guarantors lg
         JOIN loans l ON l.id = lg.loan_id
         JOIN users u ON u.id = l.user_id
         WHERE lg.guarantor_id = $1
         ORDER BY lg.created_at DESC`,
        [guarantorId]
    );
    return rows;
};

const checkActiveLoan = async (userId) => {
    const { rows } = await pool.query(
        `SELECT id FROM loans
         WHERE user_id=$1 AND status IN ('approved','disbursed','active')
         LIMIT 1`,
        [userId]
    );
    return rows.length > 0;
};

const getLoanLimit = async (userId) => {
    const { rows } = await pool.query(
        `SELECT a.balance, a.shares
         FROM accounts a
         WHERE a.user_id = $1`,
        [userId]
    );
    if (!rows[0]) return 0;
    // Loan limit = 3x savings balance
    return parseFloat(rows[0].balance) * 3;
};

module.exports = {
    createLoan,
    getLoansByUser,
    getLoanById,
    updateLoanStatus,
    recordRepayment,
    addGuarantor,
    respondToGuarantor,
    getGuarantorRequests,
    checkActiveLoan,
    getLoanLimit,
};
