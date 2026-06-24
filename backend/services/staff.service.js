const bcrypt = require('bcrypt');
const { generateMemberNumber } = require('../utils/helpers');
const staffQueries = require('../queries/staff.queries');
const {
    findMemberByPhoneOrIdOrEmail,
    onboardMember,
    listMembersWithAccounts,
    getMemberWithDetails,
} = staffQueries;

const SALT_ROUNDS = 10;

const onboardNewMember = async ({
    fullName,
    phone,
    pin,
    idNumber,
    email,
    kraPin,
    maritalStatus,
    dateOfBirth,
    gender,
    physicalAddress,
    signatureFilePath,
    passportPhotoFilePath,
}) => {
    // Check for duplicates
    const existing = await findMemberByPhoneOrIdOrEmail(phone, idNumber, email);
    if (existing) {
        let field = 'Phone number';
        if (existing.id_number === idNumber) field = 'ID number';
        else if (existing.email === email) field = 'Email';
        throw { statusCode: 409, message: `${field} is already registered to another member` };
    }

    const pinHash = await bcrypt.hash(pin || '0000', SALT_ROUNDS);
    const seq = await staffQueries.getNextMemberSequence();
    const memberNumber = generateMemberNumber(seq);

    const result = await onboardMember({
        fullName,
        phone,
        pinHash,
        idNumber,
        email,
        memberNumber,
        kraPin,
        maritalStatus,
        dateOfBirth,
        gender,
        physicalAddress,
        signatureFilePath,
        passportPhotoFilePath,
    });

    return {
        member: {
            id: result.user.id,
            fullName: result.user.full_name,
            phone: result.user.phone,
            email: result.user.email,
            idNumber: result.user.id_number,
            memberNumber: result.user.member_number,
            role: result.user.role,
            isActive: result.user.is_active,
            createdAt: result.user.created_at,
        },
        accounts: result.accounts.map((a) => ({
            id: a.id,
            accountNumber: a.account_number,
            accountType: a.account_type,
            balance: a.balance,
            shares: a.shares,
            isActive: a.is_active,
            createdAt: a.created_at,
        })),
    };
};

const listMembers = async ({ limit, offset, status }) => {
    const members = await listMembersWithAccounts({ limit, offset, status });
    return { members, total: members.length };
};

const getMember = async (userId) => {
    const member = await getMemberWithDetails(userId);
    if (!member) throw { statusCode: 404, message: 'Member not found' };
    return member;
};

module.exports = { onboardNewMember, listMembers, getMember };