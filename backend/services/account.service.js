const { getAccountByUserId, getAllAccounts } = require('../queries/account.queries');

const getMyAccount = async (userId) => {
    const account = await getAccountByUserId(userId);
    if (!account) throw { statusCode: 404, message: 'Account not found' };
    return account;
};

const getBalance = async (userId) => {
    const account = await getAccountByUserId(userId);
    if (!account) throw { statusCode: 404, message: 'Account not found' };
    return { balance: account.balance, accountNumber: account.account_number };
};

const listAccounts = async ({ limit, offset }) => {
    return getAllAccounts({ limit, offset });
};

module.exports = { getMyAccount, getBalance, listAccounts };
