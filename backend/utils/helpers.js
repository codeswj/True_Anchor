const { v4: uuidv4 } = require('uuid');

// Generate a member number e.g. IC-000123
const generateMemberNumber = (sequence) => {
    return `IC-${String(sequence).padStart(6, '0')}`;
};

// Extract the numeric suffix from a member number (e.g. "IC-000123" → "000123")
const getMemberSuffix = (memberNumber) => {
    return memberNumber.split('-')[1] || String(memberNumber).padStart(6, '0');
};

// Generate sub-account number from member number with account type digit
// Account type digits: 5=shares, 4=savings, 3=loans, 2=transactional
// Example: member IC-000002 → shares IC-500002, savings IC-400002, loans IC-300002, transactional IC-200002
const generateAccountNumber = (memberNumber, accountType) => {
    const typeDigits = { shared: '5', savings: '4', loans: '3', transactional: '2' };
    const digit = typeDigits[accountType] || '2';
    const suffix = getMemberSuffix(memberNumber);
    const modifiedSuffix = digit + suffix.substring(1);
    return `IC-${modifiedSuffix}`;
};

// Generate a loan number e.g. LN-000123
const generateLoanNumber = (sequence) => {
    return `LN-${String(sequence).padStart(6, '0')}`;
};

// Generate a transaction reference e.g. TXN-uuid-short
const generateReference = () => {
    return `TXN-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
};

// Format phone to Safaricom 254 format
const formatPhone = (phone) => {
    phone = phone.replace(/\s+/g, '');
    if (phone.startsWith('+254')) return phone.replace('+', '');
    if (phone.startsWith('254'))  return phone;
    if (phone.startsWith('0'))    return `254${phone.substring(1)}`;
    return phone;
};

// Compute monthly repayment (flat interest)
const computeMonthlyRepayment = (principal, annualRate, termMonths) => {
    const totalInterest = (principal * (annualRate / 100) * termMonths) / 12;
    const totalRepayable = principal + totalInterest;
    const monthly = totalRepayable / termMonths;
    return {
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalRepayable: parseFloat(totalRepayable.toFixed(2)),
        monthlyRepayment: parseFloat(monthly.toFixed(2)),
    };
};

module.exports = {
    generateMemberNumber,
    generateAccountNumber,
    generateLoanNumber,
    generateReference,
    formatPhone,
    computeMonthlyRepayment,
};
