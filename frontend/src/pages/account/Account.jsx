import { useEffect, useState } from 'react';
import { bankTransfer, getMyAccount, getProfile, mobileMoneyTransfer, savingsTransfer, internalTransfer } from '../../api/services';
import { PageHeader, formatKES, Modal } from '../../components/ui/index';
import { CreditCard, User, Phone, Mail, Hash, Calendar, Shield, ReceiptText, Wallet, ArrowLeftRight, Smartphone, PiggyBank, Building2, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ACCOUNT_META = {
  shared: { label: 'Share Capital (SHR)', icon: PiggyBank, color: 'green', desc: 'Savings, contributions & dividends' },
  transactional: { label: 'Transactional (TXN)', icon: Wallet, color: 'blue', desc: 'Deposits, withdrawals & loan repayments' },
  backoffice: { label: 'Backoffice (BOF)', icon: Building2, color: 'purple', desc: 'Fees, penalties & adjustments (admin-managed)' },
};

export default function Account() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [bankTransferOpen, setBankTransferOpen] = useState(false);
  const [mobileMoneyOpen, setMobileMoneyOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [internalTransferOpen, setInternalTransferOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bankForm, setBankForm] = useState({ amount: '', bankName: '', bankAccount: '', description: '', accountType: 'transactional' });
  const [mobileForm, setMobileForm] = useState({ amount: '', mpesaPhone: '', description: '', accountType: 'transactional' });
  const [savingsForm, setSavingsForm] = useState({ amount: '', description: '' });
  const [internalForm, setInternalForm] = useState({ amount: '', fromAccountType: 'transactional', toAccountType: 'shared', description: '' });

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  };

  const loadAccount = () => {
    return Promise.all([getMyAccount(), getProfile()])
      .then(([accountRes, profileRes]) => {
        const data = accountRes.data.data;
        setAccount(data);
        setSubAccounts(data.sub_accounts || []);
        updateUser(profileRes.data.data);
      });
  };

  useEffect(() => {
    loadAccount()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IC';

  const handleBankTransfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bankTransfer({
        amount: parseFloat(bankForm.amount),
        bankName: bankForm.bankName,
        bankAccount: bankForm.bankAccount,
        description: bankForm.description,
        accountType: bankForm.accountType,
      });
      toast.success('Bank transfer submitted');
      setBankTransferOpen(false);
      setBankForm({ amount: '', bankName: '', bankAccount: '', description: '', accountType: 'transactional' });
      await loadAccount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bank transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMobileMoney = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mobileMoneyTransfer({
        recipientPhone: mobileForm.mpesaPhone,
        amount: parseFloat(mobileForm.amount),
        description: mobileForm.description,
        accountType: mobileForm.accountType,
      });
      toast.success('Money sent successfully');
      setMobileMoneyOpen(false);
      setMobileForm({ amount: '', mpesaPhone: '', description: '', accountType: 'transactional' });
      await loadAccount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mobile money transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await savingsTransfer({
        amount: parseFloat(savingsForm.amount),
        description: savingsForm.description,
      });
      toast.success('Savings transfer successful');
      setSavingsOpen(false);
      setSavingsForm({ amount: '', description: '' });
      await loadAccount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Savings transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await internalTransfer({
        amount: parseFloat(internalForm.amount),
        fromAccountType: internalForm.fromAccountType,
        toAccountType: internalForm.toAccountType,
        description: internalForm.description,
      });
      toast.success('Internal transfer successful');
      setInternalTransferOpen(false);
      setInternalForm({ amount: '', fromAccountType: 'transactional', toAccountType: 'shared', description: '' });
      await loadAccount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Internal transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const memberFields = [
    { label: 'Full Name', value: user?.full_name, icon: User },
    { label: 'Phone Number', value: user?.phone, icon: Phone },
    { label: 'Email', value: user?.email || 'Not set', icon: Mail },
    { label: 'Member Number', value: user?.member_number || '—', icon: Hash },
    { label: 'National ID', value: user?.id_number || 'Not set', icon: Shield },
    { label: 'Role', value: user?.role, icon: Shield },
    { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—', icon: Calendar },
  ];

  const getSubAccount = (type) => subAccounts.find(a => a.account_type === type);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="My Account" subtitle="Your membership and sub-accounts" />

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <button type="button" onClick={() => navigate('/account/statements')}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <ReceiptText size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Statements</p>
            <p className="text-xs text-slate-500 mt-1">Transaction history</p>
          </div>
        </button>

        <button type="button" onClick={() => setInternalTransferOpen(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Internal Transfer</p>
            <p className="text-xs text-slate-500 mt-1">Between sub-accounts</p>
          </div>
        </button>

        <button type="button" onClick={() => setBankTransferOpen(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Bank Transfer</p>
            <p className="text-xs text-slate-500 mt-1">Send to bank account</p>
          </div>
        </button>

        <button type="button" onClick={() => setMobileMoneyOpen(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Smartphone size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Mobile Money</p>
            <p className="text-xs text-slate-500 mt-1">Send to mobile number</p>
          </div>
        </button>

        <button type="button" onClick={() => setSavingsOpen(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <PiggyBank size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Savings</p>
            <p className="text-xs text-slate-500 mt-1">Move to shares</p>
          </div>
        </button>
      </div>

      {/* Profile Card */}
      <div className="header-gradient text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <p className="text-blue-200 text-sm">{user?.phone}</p>
            <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 border-t border-white/20 pt-4">
          {[
            { label: 'Member No.', value: user?.member_number || '—' },
            { label: 'Total Balance', value: formatKES(account?.balance) },
            { label: 'Share Capital', value: formatKES(account?.shares) },
            { label: 'Member Since', value: formatDate(user?.created_at) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-blue-200 text-xs">{label}</p>
              <p className="text-white font-bold text-sm mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Accounts Section */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-lg">Your Sub-Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['shared', 'transactional', 'backoffice'].map((type) => {
            const sub = getSubAccount(type);
            const meta = ACCOUNT_META[type];
            const colorMap = {
              green: 'bg-green-50 text-green-800 border-green-200',
              blue: 'bg-blue-50 text-blue-800 border-blue-200',
              purple: 'bg-purple-50 text-purple-800 border-purple-200',
            };
            const iconColorMap = {
              green: 'bg-green-600',
              blue: 'bg-blue-600',
              purple: 'bg-purple-600',
            };
            const IconComponent = meta.icon;

            return (
              <div key={type} className={`rounded-2xl border-2 ${colorMap[meta.color]} shadow-sm p-5`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold">{meta.label}</p>
                    <p className="text-xs opacity-70 mt-0.5 font-mono">{sub?.account_number || '—'}</p>
                  </div>
                  <div className={`w-11 h-11 ${iconColorMap[meta.color]} rounded-xl flex items-center justify-center shadow-sm`}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs opacity-60 uppercase tracking-wide">Balance</p>
                  <p className="text-2xl font-bold mt-0.5">{formatKES(sub?.balance || 0)}</p>
                </div>

                {type === 'shared' && (
                  <div className="mb-3">
                    <p className="text-xs opacity-60 uppercase tracking-wide">Shares</p>
                    <p className="text-lg font-semibold mt-0.5">{formatKES(sub?.shares || 0)}</p>
                  </div>
                )}

                <p className="text-xs opacity-60 leading-relaxed">{meta.desc}</p>

                {sub?.is_active === false && (
                  <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Inactive</span>
                )}
                {sub?.is_active !== false && (
                  <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Account Information</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Member Number', value: user?.member_number },
              { label: 'Total Balance', value: formatKES(account?.balance) },
              { label: 'Share Capital', value: formatKES(account?.shares) },
              { label: 'Status', value: 'Active' },
              { label: 'Date Opened', value: formatDate(user?.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className="text-slate-800 font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Member Details</h3>
          </div>
          <div className="space-y-1">
            {memberFields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Icon size={14} className="text-slate-400" />
                  {label}
                </div>
                <span className="text-slate-800 font-semibold text-sm capitalize">{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Modal */}
      <Modal open={balanceOpen} onClose={() => setBalanceOpen(false)} title="Account Balance">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Balance</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{formatKES(account?.balance)}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Shares</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{formatKES(account?.shares)}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Account Number</p>
            <p className="font-semibold text-slate-800 mt-1">{account?.account_number || '—'}</p>
          </div>
          <button onClick={() => setBalanceOpen(false)} className="btn-primary w-full">Close</button>
        </div>
      </Modal>

      {/* Bank Transfer Modal */}
      <Modal open={bankTransferOpen} onClose={() => setBankTransferOpen(false)} title="Bank Transfer">
        <form onSubmit={handleBankTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer From</label>
            <select className="input-field" value={bankForm.accountType}
              onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}>
              <option value="transactional">Transactional (TXN)</option>
              <option value="shared">Share Capital (SHR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
            <input type="number" className="input-field" placeholder="0.00" value={bankForm.amount}
              onChange={(e) => setBankForm({ ...bankForm, amount: e.target.value })} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name *</label>
            <input type="text" className="input-field" placeholder="e.g. KCB" value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number *</label>
            <input type="text" className="input-field" placeholder="Bank account number" value={bankForm.bankAccount}
              onChange={(e) => setBankForm({ ...bankForm, bankAccount: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <input type="text" className="input-field" placeholder="Optional note" value={bankForm.description}
              onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setBankTransferOpen(false)}
              className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Send Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mobile Money Modal */}
      <Modal open={mobileMoneyOpen} onClose={() => setMobileMoneyOpen(false)} title="Mobile Money Transfer">
        <form onSubmit={handleMobileMoney} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer From</label>
            <select className="input-field" value={mobileForm.accountType}
              onChange={(e) => setMobileForm({ ...mobileForm, accountType: e.target.value })}>
              <option value="transactional">Transactional (TXN)</option>
              <option value="shared">Share Capital (SHR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number *</label>
            <input type="tel" className="input-field" placeholder="07XX XXX XXX" value={mobileForm.mpesaPhone}
              onChange={(e) => setMobileForm({ ...mobileForm, mpesaPhone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
            <input type="number" className="input-field" placeholder="0.00" value={mobileForm.amount}
              onChange={(e) => setMobileForm({ ...mobileForm, amount: e.target.value })} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <input type="text" className="input-field" placeholder="Optional note" value={mobileForm.description}
              onChange={(e) => setMobileForm({ ...mobileForm, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setMobileMoneyOpen(false)}
              className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Send Money'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Savings Transfer Modal */}
      <Modal open={savingsOpen} onClose={() => setSavingsOpen(false)} title="Move to Savings (Shares)">
        <form onSubmit={handleSavings} className="space-y-4">
          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-xl">
            Transfers from your Transactional account to your Share Capital account.
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
            <input type="number" className="input-field" placeholder="0.00" value={savingsForm.amount}
              onChange={(e) => setSavingsForm({ ...savingsForm, amount: e.target.value })} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <input type="text" className="input-field" placeholder="Optional note" value={savingsForm.description}
              onChange={(e) => setSavingsForm({ ...savingsForm, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setSavingsOpen(false)}
              className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Move to Savings'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Internal Transfer Modal */}
      <Modal open={internalTransferOpen} onClose={() => setInternalTransferOpen(false)} title="Internal Transfer (Between Sub-Accounts)">
        <form onSubmit={handleInternalTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">From Account</label>
              <select className="input-field" value={internalForm.fromAccountType}
                onChange={(e) => setInternalForm({ ...internalForm, fromAccountType: e.target.value })}>
                <option value="transactional">Transactional (TXN)</option>
                <option value="shared">Share Capital (SHR)</option>
              </select>
              {(() => {
                const from = getSubAccount(internalForm.fromAccountType);
                return from ? <p className="text-xs text-slate-400 mt-1">Balance: {formatKES(from.balance)}</p> : null;
              })()}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">To Account</label>
              <select className="input-field" value={internalForm.toAccountType}
                onChange={(e) => setInternalForm({ ...internalForm, toAccountType: e.target.value })}>
                <option value="shared">Share Capital (SHR)</option>
                <option value="transactional">Transactional (TXN)</option>
              </select>
              {(() => {
                const to = getSubAccount(internalForm.toAccountType);
                return to ? <p className="text-xs text-slate-400 mt-1">Balance: {formatKES(to.balance)}</p> : null;
              })()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
            <input type="number" className="input-field" placeholder="0.00" value={internalForm.amount}
              onChange={(e) => setInternalForm({ ...internalForm, amount: e.target.value })} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <input type="text" className="input-field" placeholder="Optional note" value={internalForm.description}
              onChange={(e) => setInternalForm({ ...internalForm, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setInternalTransferOpen(false)}
              className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}