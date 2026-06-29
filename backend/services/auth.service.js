const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const jwtCfg  = require('../config/jwt');
const {
    findUserByPhone,
    findUserById,
    createUser,
    createMemberAccounts,
    getNextSequence,
    updatePin,
} = require('../queries/auth.queries');
const {
    generateMemberNumber,
} = require('../utils/helpers');

const SALT_ROUNDS = 10;

const register = async ({ fullName, phone, pin, idNumber, email }) => {
    const existing = await findUserByPhone(phone);
    if (existing) throw { statusCode: 409, message: 'Phone number already registered' };

    const pinHash  = await bcrypt.hash(pin, SALT_ROUNDS);
    const seq      = await getNextSequence('users', 'id');
    const memberNo = generateMemberNumber(seq);

    const user     = await createUser({ fullName, phone, pinHash, idNumber, email, memberNumber: memberNo });
    const accounts = await createMemberAccounts(user.id, memberNo);
    const account  = accounts.find((acc) => acc.account_type === 'transactional') || accounts[0];

    const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        jwtCfg.secret,
        { expiresIn: jwtCfg.expiresIn }
    );

    return {
        token,
        user: {
            id: user.id,
            fullName: user.full_name,
            phone: user.phone,
            email: user.email,
            idNumber: user.id_number,
            memberNumber: user.member_number,
            role: user.role,
            createdAt: user.created_at,
        },
        account: {
            id: account.id,
            accountNumber: account.account_number,
            balance: account.balance,
        },
    };
};

const login = async ({ phone, pin }) => {
    const user = await findUserByPhone(phone);
    if (!user)            throw { statusCode: 401, message: 'Invalid phone or PIN' };
    if (!user.is_active)  throw { statusCode: 403, message: 'Account is deactivated' };

    const match = await bcrypt.compare(pin, user.pin_hash);
    if (!match) throw { statusCode: 401, message: 'Invalid phone or PIN' };

    const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        jwtCfg.secret,
        { expiresIn: jwtCfg.expiresIn }
    );

    return {
        token,
        user: {
            id: user.id,
            fullName: user.full_name,
            phone: user.phone,
            email: user.email,
            idNumber: user.id_number,
            memberNumber: user.member_number,
            role: user.role,
            accountId: user.account_id,
            accountNumber: user.account_number,
            balance: user.balance,
            createdAt: user.created_at,
        },
    };
};

const getProfile = async (userId) => {
    const user = await findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        idNumber: user.id_number,
        memberNumber: user.member_number,
        role: user.role,
        accountId: user.account_id,
        accountNumber: user.account_number,
        balance: user.balance,
        createdAt: user.created_at,
    };
};

const changePin = async (userId, { oldPin, newPin }) => {
    const user = await findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const match = await bcrypt.compare(oldPin, user.pin_hash);
    if (!match) throw { statusCode: 401, message: 'Current PIN is incorrect' };

    const newHash = await bcrypt.hash(newPin, SALT_ROUNDS);
    await updatePin(userId, newHash);
};

module.exports = { register, login, getProfile, changePin };
