import api from './axios';

// AUTH
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');
export const changePin = (data) => api.put('/auth/change-pin', data);

// ACCOUNTS
export const getMyAccount = () => api.get('/accounts/me');
export const getBalance = () => api.get('/accounts/balance');
export const listAccounts = (params) => api.get('/accounts', { params });

// TRANSACTIONS
export const deposit = (data) => api.post('/transactions/deposit', data);
export const withdraw = (data) => api.post('/transactions/withdraw', data);
export const bankTransfer = (data) => api.post('/transactions/bank-transfer', data);
export const mobileMoneyTransfer = (data) => api.post('/transactions/mobile-money-transfer', data);
export const savingsTransfer = (data) => api.post('/transactions/savings-transfer', data);
export const internalTransfer = (data) => api.post('/transactions/internal-transfer', data);
export const buyAirtime = (data) => api.post('/transactions/airtime', data);
export const payUtility = (data) => api.post('/transactions/utility', data);
export const getStatement = (params) => api.get('/transactions/statement', { params });

// LOANS
export const applyLoan = (data) => api.post('/loans/apply', data);
export const getMyLoans = () => api.get('/loans/my');
export const getLoanDetails = (id) => api.get(`/loans/${id}`);
export const getMyLoanLimit = () => api.get('/loans/limit');
export const repayLoan = (id, data) => api.post(`/loans/${id}/repay`, data);
export const approveLoan = (id) => api.put(`/loans/${id}/approve`);
export const rejectLoan = (id, data) => api.put(`/loans/${id}/reject`, data);
export const disburseLoan = (id) => api.put(`/loans/${id}/disburse`);
export const respondGuarantor = (loanId, data) => api.put(`/loans/${loanId}/guarantor`, data);
export const getMyGuarantorRequests = () => api.get('/loans/guarantor-requests');

// MESSAGES
export const getMessages = () => api.get('/messages');
export const getUnreadCount = () => api.get('/messages/unread-count');
export const markRead = (id) => api.put(`/messages/${id}/read`);
export const markAllRead = () => api.put('/messages/read-all');
export const deleteMessage = (id) => api.delete(`/messages/${id}`);

// ADMIN
export const adminListUsers = (params) => api.get('/admin/users', { params });
export const adminGetUser = (id) => api.get(`/admin/users/${id}`);

// REPORTS
export const getGeneralReport = (params) => api.get('/reports/general', { params });
export const getMembersReport = () => api.get('/reports/members');
export const getMemberReportById = (id) => api.get(`/reports/members/${id}`);

// NOTIFICATIONS
export const getNotifications = () => api.get('/notifications');

// MPESA
export const initiateMpesa = (data) => api.post('/mpesa/stk-push', data);
