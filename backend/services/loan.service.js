const { pool }               = require('../config/db');
const { getAccountByUserId, getAccountById, updateBalance } = require('../queries/account.queries');
const { createTransaction }  = require('../queries/transaction.queries');
const loanQ                  = require('../queries/loan.queries');
const { generateReference, generateLoanNumber, computeMonthlyRepayment } = require('../utils/helpers');

const INTEREST_RATE = 12; // 12% per annum flat

const applyLoan = async (userId, { loanType, principalAmount, loanTermMonths, purpose, guarantorIds = [] }) => {
    const account = await getAccountByUserId(userId);
    if (!account) throw { statusCode: 404, message: 'Account not found' };

    const hasActive = await loanQ.checkActiveLoan(userId);
    if (hasActive) throw { statusCode: 400, message: 'You already have an active loan' };

    const limit = await loanQ.getLoanLimit(userId);
    if (parseFloat(principalAmount) > limit) {
        throw { statusCode: 400, message: `Loan amount exceeds your limit of KES ${limit.toLocaleString()}` };
    }

    const { totalRepayable, monthlyRepayment } =
        computeMonthlyRepayment(parseFloat(principalAmount), INTEREST_RATE, parseInt(loanTermMonths));

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const seq        = await pool.query('SELECT COUNT(*) AS total FROM loans');
        const loanNumber = generateLoanNumber(parseInt(seq.rows[0].total) + 1);

        const loan = await loanQ.createLoan(client, {
            userId,
            accountId:      account.id,
            loanNumber,
            loanType:       loanType || 'normal',
            principalAmount,
            interestRate:   INTEREST_RATE,
            loanTermMonths,
            monthlyRepayment,
            totalRepayable,
            purpose,
        });

        for (const gid of guarantorIds) {
            await loanQ.addGuarantor(client, {
                loanId:           loan.id,
                guarantorId:      gid,
                amountGuaranteed: principalAmount,
            });
        }

        await client.query('COMMIT');
        return loan;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const approveLoan = async (adminId, loanId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const loan = await loanQ.getLoanById(loanId);
        if (!loan) throw { statusCode: 404, message: 'Loan not found' };
        if (loan.status !== 'pending') throw { statusCode: 400, message: `Loan is already ${loan.status}` };

        const updated = await loanQ.updateLoanStatus(client, loanId, 'approved', {
            approvedBy: adminId,
            approvedAt: new Date(),
        });
        await client.query('COMMIT');
        return updated;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const rejectLoan = async (adminId, loanId, rejectionReason) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const loan = await loanQ.getLoanById(loanId);
        if (!loan) throw { statusCode: 404, message: 'Loan not found' };
        if (loan.status !== 'pending') throw { statusCode: 400, message: `Loan is already ${loan.status}` };

        const updated = await loanQ.updateLoanStatus(client, loanId, 'rejected', {
            approvedBy: adminId,
            rejectionReason,
        });
        await client.query('COMMIT');
        return updated;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const disburseLoan = async (adminId, loanId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const loan = await loanQ.getLoanById(loanId);
        if (!loan) throw { statusCode: 404, message: 'Loan not found' };
        if (loan.status !== 'approved') throw { statusCode: 400, message: 'Loan must be approved before disbursement' };

        const account       = await getAccountById(loan.account_id);
        const balanceBefore = parseFloat(account.balance);
        const balanceAfter  = balanceBefore + parseFloat(loan.principal_amount);

        await updateBalance(client, account.id, balanceAfter);
        await createTransaction(client, {
            accountId:    account.id,
            userId:       loan.user_id,
            type:         'loan_disbursement',
            amount:       loan.principal_amount,
            balanceBefore,
            balanceAfter,
            status:       'completed',
            reference:    generateReference(),
            description:  `Loan disbursement - ${loan.loan_number}`,
        });

        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + parseInt(loan.loan_term_months));

        const updated = await loanQ.updateLoanStatus(client, loanId, 'active', {
            disbursedAt: new Date(),
            dueDate:     dueDate.toISOString().split('T')[0],
        });

        await client.query('COMMIT');
        return updated;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const repayLoan = async (userId, loanId, { amount }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const loan = await loanQ.getLoanById(loanId);
        if (!loan)                     throw { statusCode: 404, message: 'Loan not found' };
        if (loan.user_id !== userId)   throw { statusCode: 403, message: 'Not your loan' };
        if (!['active','disbursed'].includes(loan.status)) throw { statusCode: 400, message: 'Loan is not active' };

        const account       = await getAccountByUserId(userId);
        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < amount) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        await createTransaction(client, {
            accountId:    account.id,
            userId,
            type:         'loan_repayment',
            amount,
            balanceBefore,
            balanceAfter,
            status:       'completed',
            reference:    generateReference(),
            description:  `Loan repayment - ${loan.loan_number}`,
        });

        const updatedLoan = await loanQ.recordRepayment(client, loanId, amount);

        if (parseFloat(updatedLoan.outstanding_balance) <= 0) {
            await loanQ.updateLoanStatus(client, loanId, 'completed', { completedAt: new Date() });
        }

        await client.query('COMMIT');
        return updatedLoan;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getMyLoans             = async (userId)                  => loanQ.getLoansByUser(userId);
const getLoanDetails         = async (loanId)                  => loanQ.getLoanById(loanId);
const getMyLoanLimit         = async (userId)                  => loanQ.getLoanLimit(userId);
const respondGuarantor       = async (userId, loanId, status)  => loanQ.respondToGuarantor(userId, loanId, status);
const getMyGuarantorRequests = async (userId)                  => loanQ.getGuarantorRequests(userId);

module.exports = {
    applyLoan, approveLoan, rejectLoan, disburseLoan, repayLoan,
    getMyLoans, getLoanDetails, getMyLoanLimit,
    respondGuarantor, getMyGuarantorRequests,
};
