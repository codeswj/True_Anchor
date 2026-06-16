import { useEffect, useState } from 'react';
import { getStatement, getMyAccount, deposit, withdraw, bankTransfer, mobileMoneyTransfer, initiateMpesa } from '../../api/services';
import { PageHeader, Modal, formatKES, StatusBadge } from '../../components/ui/index';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Filter, HandCoins, Wallet, PiggyBank, Building2, Phone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TABS = [
  { key: 'deposit',  label: 'Deposit',  icon: ArrowDownLeft,  iconBg: 'bg-emerald-500' },
  { key: 'withdraw', label: 'Withdraw', icon: ArrowUpRight,   iconBg: 'bg-red-500' },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight, iconBg: 'bg-blue-400' },
  { key: 'loans',    label: 'Loans',    icon: HandCoins,      iconBg: 'bg-purple-500' },
];

const getTxnLabel = (type) => {
  if (type === 'internal_transfer') return 'mobile money transfer';
  if (type === 'savings_transfer') return 'savings transfer';
  return type?.replace(/_/g, ' ');
};

export default function Transactions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeAction, setActiveAction] = useState(searchParams.get('tab') || '');
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState('');
  const [subAccounts, setSubAccounts] = useState([]);

  const fetchTxns = () => {
    setLoading(true);
    getStatement({ limit: 50, type: filter || undefined })
      .then(res => setTxns(res.data.data?.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTxns();
    getMyAccount().then(res => {
      setSubAccounts(res.data.data?.sub_accounts || []);
    }).catch(() => {});
  }, [filter]);

  const setFormField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleAction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amount = parseFloat(form.amount);
      switch (activeAction) {
        case 'deposit':
          if (form.depositMethod === 'cash') {
            await deposit({
              amount,
              description: form.description || 'Cash deposit',
              accountType: form.accountType || 'transactional',
            });
            toast.success('Cash deposit successful!');
          } else {
            await initiateMpesa({ phone: form.mpesaPhone, amount, description: form.description });
            toast.success('M-Pesa prompt sent. Enter your PIN on your phone to complete.');
          }
          break;
        case 'withdraw':
          await withdraw({ amount, description: form.description, accountType: form.accountType || 'transactional' });
          toast.success('Withdrawal successful!');
          break;
        case 'transfer':
          if (form.transferType === 'mobile_money') {
            await mobileMoneyTransfer({
              recipientPhone: form.mpesaPhone,
              amount,
              description: form.description,
              accountType: form.accountType || 'transactional',
            });
          } else {
            await bankTransfer({
              amount,
              bankName: form.bankName,
              bankAccount: form.bankAccount,
              description: form.description,
              accountType: form.accountType || 'transactional',
            });
          }
          toast.success('Transfer successful!');
          break;
        default: break;
      }
      setActiveAction('');
      setForm({});
      fetchTxns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = () => {
    const amountField = (
      <div key="amount">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
        <input type="number" className="input-field" placeholder="0.00" value={form.amount || ''} onChange={setFormField('amount')} required min="1" />
      </div>
    );
    const descField = (
      <div key="desc">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
        <input type="text" className="input-field" placeholder="Optional note" value={form.description || ''} onChange={setFormField('description')} />
      </div>
    );
    const mpesaPhoneField = (
      <div key="mpesaPhone">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">M-Pesa Phone Number *</label>
        <input type="tel" className="input-field" placeholder="07XX XXX XXX" value={form.mpesaPhone || ''} onChange={setFormField('mpesaPhone')} required />
      </div>
    );
    const accountTypeField = (allowed = ['transactional', 'shared']) => (
      <div key="accountType">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Type</label>
        <select className="input-field" value={form.accountType || 'transactional'} onChange={setFormField('accountType')}>
          {allowed.map(t => (
            <option key={t} value={t}>{t === 'transactional' ? 'Transactional (TXN)' : 'Share Capital (SHR)'}</option>
          ))}
        </select>
        {(() => {
          const sub = subAccounts.find(a => a.account_type === (form.accountType || 'transactional'));
          return sub ? <p className="text-xs text-slate-400 mt-1">Balance: {formatKES(sub.balance)}</p> : null;
        })()}
      </div>
    );

    switch (activeAction) {
      case 'deposit':
        return [
          <div key="depositMethod">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deposit Method</label>
            <div className="flex gap-2">
              <button type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors flex items-center justify-center gap-2 ${form.depositMethod === 'mpesa' || !form.depositMethod ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                onClick={() => setForm({ ...form, depositMethod: 'mpesa' })}>
                <Phone size={16} /> M-Pesa
              </button>
              <button type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors flex items-center justify-center gap-2 ${form.depositMethod === 'cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'}`}
                onClick={() => setForm({ ...form, depositMethod: 'cash' })}>
                <Banknote size={16} /> Cash
              </button>
            </div>
          </div>,
          ...(form.depositMethod === 'cash' ? [accountTypeField()] : [mpesaPhoneField]),
          amountField,
          descField,
        ];
      case 'withdraw':
        return [accountTypeField(), amountField, descField];
      case 'transfer':
        return [
          <div key="transferType">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer Type</label>
            <div className="flex gap-2">
              <button type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${form.transferType === 'mobile_money' || !form.transferType ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                onClick={() => setForm({ ...form, transferType: 'mobile_money' })}>
                Mobile Money
              </button>
              <button type="button"
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${form.transferType === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                onClick={() => setForm({ ...form, transferType: 'bank' })}>
                Bank Transfer
              </button>
            </div>
          </div>,
          accountTypeField(),
          amountField,
          ...(form.transferType === 'bank' ? [
            <div key="bank">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name *</label>
              <input type="text" className="input-field" placeholder="e.g. KCB" value={form.bankName || ''} onChange={setFormField('bankName')} required />
            </div>,
            <div key="acc">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number *</label>
              <input type="text" className="input-field" placeholder="Bank account number" value={form.bankAccount || ''} onChange={setFormField('bankAccount')} required />
            </div>,
          ] : [
            <div key="mpesaPhone">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number *</label>
              <input type="tel" className="input-field" placeholder="07XX XXX XXX" value={form.mpesaPhone || ''} onChange={setFormField('mpesaPhone')} required />
            </div>,
          ]),
          descField,
        ];
      default: return [];
    }
  };

  const actionInfo = TABS.find(t => t.key === activeAction);

  const handleQuickAction = (key) => {
    if (key === 'loans') {
      navigate('/loans');
      return;
    }
    setActiveAction(key);
    setForm({});
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Send, receive, and manage your money" />

      {/* Quick Actions */}
      <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 px-5 py-4 shadow-sm sm:px-10">
        <div className="pointer-events-none absolute -left-20 -top-12 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative grid grid-cols-4 items-start gap-4">
          {TABS.map(({ key, label, icon: Icon, iconBg }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleQuickAction(key)}
              className="group flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} text-white shadow-lg transition-transform group-hover:-translate-y-0.5 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white`}>
                <Icon size={21} strokeWidth={2.4} />
              </span>
              <span className="text-xs font-bold text-white sm:text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Account Summary */}
      {subAccounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {subAccounts.map((sub) => {
            const colors = {
              transactional: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Wallet },
              shared: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: PiggyBank },
              backoffice: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: Building2 },
            };
            const c = colors[sub.account_type] || colors.transactional;
            const Icon = c.icon;

            return (
              <div key={sub.id} className={`${c.bg} ${c.border} border rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={c.text} />
                  <span className={`text-xs font-bold uppercase ${c.text}`}>{sub.account_type}</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatKES(sub.balance)}</p>
                <p className="text-xs text-slate-400 font-mono">{sub.account_number}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 flex-1">Transaction History</h3>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="bank_transfer">Bank Transfers</option>
              <option value="internal_transfer">Mobile Money Transfers</option>
              <option value="savings_transfer">Savings Transfers</option>
              <option value="airtime">Airtime</option>
              <option value="utility_payment">Utilities</option>
              <option value="loan_disbursement">Loan Disbursements</option>
              <option value="loan_repayment">Loan Repayments</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : txns.length === 0 ? (
          <div className="py-14 text-center">
            <ArrowLeftRight size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {txns.map((txn) => {
              const isCredit = ['deposit', 'loan_disbursement'].includes(txn.type);
              return (
                <div key={txn.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCredit ? <ArrowDownLeft size={18} className="text-green-600" /> : <ArrowUpRight size={18} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-semibold capitalize">{getTxnLabel(txn.type)}</p>
                    <p className="text-slate-400 text-xs truncate">{txn.description || txn.reference || '—'}</p>
                  </div>
                  <div className="hidden md:block">
                    <StatusBadge status={txn.status} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}{formatKES(txn.amount)}
                    </p>
                    <p className="text-slate-400 text-xs">{new Date(txn.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal open={!!activeAction} onClose={() => { setActiveAction(''); setForm({}); }}
        title={actionInfo?.label || ''}>
        <form onSubmit={handleAction} className="space-y-4">
          {renderFormFields()}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setActiveAction(''); setForm({}); }}
              className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Confirm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}