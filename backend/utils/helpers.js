const { v4: uuidv4 } = require('uuid');

// Generate a member number e.g. YC-000123
const generateMemberNumber = (sequence) => {
    return `YC-${String(sequence).padStart(6, '0')}`;
};

// Generate an account number e.g. TXN-000123
const generateAccountNumber = (sequence, prefix = 'TXN') => {
    return `${prefix}-${String(sequence).padStart(6, '0')}`;
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
