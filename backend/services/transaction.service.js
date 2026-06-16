const { pool } = require('../config/db');
const { getAccountByUserId, updateBalance, updateShares } = require('../queries/account.queries');
const { createTransaction, getTransactionsByAccount } = require('../queries/transaction.queries');
const { generateReference, formatPhone } = require('../utils/helpers');

const MEMBER_ACCOUNT_TYPES = ['shared', 'transactional', 'backoffice'];
const MEMBER_MANAGED_ACCOUNT_TYPES = ['shared', 'transactional'];

const normalizeAccountType = (accountType = 'transactional', allowedTypes = MEMBER_ACCOUNT_TYPES) => {
    if (!allowedTypes.includes(accountType)) {
        throw { statusCode: 400, message: 'Invalid account type' };
    }
    return accountType;
};

const requireTransactionalAccount = (accountType = 'transactional') => {
    if (accountType !== 'transactional') {
        throw { statusCode: 400, message: 'This action can only use the transactional account' };
    }
};

const getMemberAccount = async (userId, accountType = 'transactional', allowedTypes = MEMBER_ACCOUNT_TYPES) => {
    const type = normalizeAccountType(accountType, allowedTypes);
    const account = await getAccountByUserId(userId, type);
    if (!account) throw { statusCode: 404, message: `${type} account not found` };
    return account;
};

const deposit = async (userId, { amount, description, accountType = 'transactional' }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getMemberAccount(userId, accountType, MEMBER_MANAGED_ACCOUNT_TYPES);

        const balanceBefore = parseFloat(account.balance);
        const balanceAfter = balanceBefore + parseFloat(amount);

        await updateBalance(client, account.id, balanceAfter);
        if (account.account_type === 'shared') await updateShares(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'deposit',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || `Deposit to ${account.account_type} account`,
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

const withdraw = async (userId, { amount, description, accountType = 'transactional' }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        requireTransactionalAccount(accountType);
        const account = await getMemberAccount(userId, accountType);

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'withdrawal',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || 'Withdrawal',
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

const bankTransfer = async (userId, { amount, bankName, bankAccount, description, accountType = 'transactional' }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        requireTransactionalAccount(accountType);
        const account = await getMemberAccount(userId, accountType);

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'bank_transfer',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || `Bank transfer to ${bankName}`,
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

const mobileMoneyTransfer = async (userId, { amount, recipientPhone, description, accountType = 'transactional' }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        requireTransactionalAccount(accountType);
        const account = await getMemberAccount(userId, accountType);
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

const internalTransfer = async (userId, { amount, fromAccountType, toAccountType, description }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const fromAccount = await getMemberAccount(userId, fromAccountType, MEMBER_MANAGED_ACCOUNT_TYPES);
        const toAccount = await getMemberAccount(userId, toAccountType, MEMBER_MANAGED_ACCOUNT_TYPES);

        if (fromAccount.id === toAccount.id) throw { statusCode: 400, message: 'Cannot transfer to the same account' };

        const fromBalanceBefore = parseFloat(fromAccount.balance);
        if (fromBalanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const fromBalanceAfter = fromBalanceBefore - parseFloat(amount);
        const toBalanceBefore = parseFloat(toAccount.balance);
        const toBalanceAfter = toBalanceBefore + parseFloat(amount);

        await updateBalance(client, fromAccount.id, fromBalanceAfter);
        await updateBalance(client, toAccount.id, toBalanceAfter);
        if (toAccount.account_type === 'shared') await updateShares(client, toAccount.id, toBalanceAfter);

        const txn = await createTransaction(client, {
            accountId: fromAccount.id,
            userId,
            type: 'internal_transfer',
            amount,
            balanceBefore: fromBalanceBefore,
            balanceAfter: fromBalanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || `Transfer from ${fromAccount.account_type} to ${toAccount.account_type}`,
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
        const transactional = await getMemberAccount(userId, 'transactional');
        const shared = await getMemberAccount(userId, 'shared');

        const balanceBefore = parseFloat(transactional.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        const sharedBefore = parseFloat(shared.balance || 0);
        const sharedAfter = sharedBefore + parseFloat(amount);

        await updateBalance(client, transactional.id, balanceAfter);
        await updateBalance(client, shared.id, sharedAfter);
        await updateShares(client, shared.id, sharedAfter);

        const txn = await createTransaction(client, {
            accountId: transactional.id,
            userId,
            type: 'savings_transfer',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || `Transfer to ${shared.account_number}`,
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

const buyAirtime = async (userId, { amount, recipientPhone }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getMemberAccount(userId, 'transactional');

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'airtime',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: `Airtime for ${recipientPhone}`,
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

const payUtility = async (userId, { amount, description, recipientName, recipientPhone }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const account = await getMemberAccount(userId, 'transactional');

        const balanceBefore = parseFloat(account.balance);
        if (balanceBefore < parseFloat(amount)) throw { statusCode: 400, message: 'Insufficient balance' };

        const balanceAfter = balanceBefore - parseFloat(amount);
        await updateBalance(client, account.id, balanceAfter);

        const txn = await createTransaction(client, {
            accountId: account.id,
            userId,
            type: 'utility_payment',
            amount,
            balanceBefore,
            balanceAfter,
            status: 'completed',
            reference: generateReference(),
            description: description || 'Utility payment',
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

const getStatement = async (userId, { limit = 20, offset = 0, type, accountType = 'transactional' }) => {
    const account = await getMemberAccount(userId, accountType);
    return getTransactionsByAccount(account.id, { limit, offset, type });
};

module.exports = { deposit, withdraw, bankTransfer, mobileMoneyTransfer, savingsTransfer, internalTransfer, buyAirtime, payUtility, getStatement };
