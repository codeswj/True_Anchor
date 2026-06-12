const { getAccountByUserId, getAccountsByUserId, getAllAccounts } = require('../queries/account.queries');

const getMyAccount = async (userId) => {
    const accounts = await getAccountsByUserId(userId);
    if (!accounts.length) throw { statusCode: 404, message: 'Account not found' };

    const transactional = accounts.find((account) => account.account_type === 'transactional');
    const shared = accounts.find((account) => account.account_type === 'shared');
    const primary = transactional || accounts[0];

    return {
        ...primary,
        balance: transactional?.balance || 0,
        shares: shared?.balance || shared?.shares || 0,
        subAccounts: accounts,
        sub_accounts: accounts,
    };
};

const getBalance = async (userId) => {
    const account = await getAccountByUserId(userId, 'transactional');
    if (!account) throw { statusCode: 404, message: 'Account not found' };
    return { balance: account.balance, accountNumber: account.account_number };
};

const listAccounts = async ({ limit, offset }) => {
    return getAllAccounts({ limit, offset });
};

module.exports = { getMyAccount, getBalance, listAccounts };
