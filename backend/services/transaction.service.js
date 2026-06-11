const { pool }               = require('../config/db');
const { getAccountByUserId, updateBalance, updateShares } = require('../queries/account.queries');
const { createTransaction, getTransactionsByAccount } = require('../queries/transaction.queries');
const { generateReference, formatPhone }  = require('../utils/helpers');

// ── Deposit ───────────────────────────────────────────────
const deposit = async (userId, { amount, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        const balanceAfter  = balanceBefore + parseFloat(amount);

        await updateBalance(client, account.id, balanceAfter);
        const txn = await createTransaction(client, {
            accountId:    account.id,
            userId,
            type:         'deposit',
            amount,
            balanceBefore,
            balanceAfter,
            status:       'completed',
            reference:    generateReference(),
            description:  description || 'Deposit',
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Withdraw ──────────────────────────────────────────────
const withdraw = async (userId, { amount, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId:    account.id,
            userId,
            type:         'withdrawal',
            amount,
            balanceBefore,
            balanceAfter,
            status:       'completed',
            reference:    generateReference(),
            description:  description || 'Withdrawal',
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Bank Transfer ─────────────────────────────────────────
const bankTransfer = async (userId, { amount, bankName, bankAccount, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId:    account.id,
            userId,
            type:         'bank_transfer',
            amount,
            balanceBefore,
            balanceAfter,
            status:       'completed',
            reference:    generateReference(),
            description:  description || `Bank transfer to ${bankName}`,
            bankName,
            bankAccount,
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const mobileMoneyTransfer = async (userId, { amount, recipientPhone, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };
        const formattedRecipientPhone = formatPhone(recipientPhone);

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'internal_transfer',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || `Mobile money transfer to ${formattedRecipientPhone}`,
            recipientPhone: formattedRecipientPhone,
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const savingsTransfer = async (userId, { amount, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        const sharesBefore = parseFloat(account.shares || 0);
        const sharesAfter = sharesBefore + parseFloat(amount);

        await updateBalance(client, account.id, balanceAfter);
        await updateShares(client, account.id, sharesAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'savings_transfer',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || 'Savings transfer',
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Buy Airtime ───────────────────────────────────────────
const buyAirtime = async (userId, { amount, recipientPhone }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId:      account.id,
            userId,
            type:           'airtime',
            amount,
            balanceBefore,
            balanceAfter,
            status:         'completed',
            reference:      generateReference(),
            description:    `Airtime for ${recipientPhone}`,
            recipientPhone,
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Pay Utility ───────────────────────────────────────────
const payUtility = async (userId, { amount, description, recipientName, recipientPhone }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getAccountByUserId(userId);
        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId:      account.id,
            userId,
            type:           'utility_payment',
            amount,
            balanceBefore,
            balanceAfter,
            status:         'completed',
            reference:      generateReference(),
            description:    description || 'Utility payment',
            recipientName,
            recipientPhone,
        });

        await client.query('COMMIT');
        return txn;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ── Account Statement ─────────────────────────────────────
const getStatement = async (userId, { limit = 20, offset = 0, type }) => {
    const account = await getAccountByUserId(userId);
    if (!account) throw { statusCode: 404, message: 'Account not found' };
    return getTransactionsByAccount(account.id, { limit, offset, type });
};

module.exports = { deposit, withdraw, bankTransfer, mobileMoneyTransfer, savingsTransfer, buyAirtime, payUtility, getStatement };
