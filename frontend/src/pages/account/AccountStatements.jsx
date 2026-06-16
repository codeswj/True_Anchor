import { useEffect, useState } from 'react';
import { getMyAccount, getProfile, getStatement } from '../../api/services';
import { PageHeader, formatKES, StatusBadge, EmptyState } from '../../components/ui/index';
import { ArrowLeft, ReceiptText, Wallet, TrendingUp, CreditCard, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getTxnLabel = (type) => {
  if (type === 'internal_transfer') return 'mobile money transfer';
  if (type === 'savings_transfer') return 'savings transfer';
  return type?.replace(/_/g, ' ');
};

const ACCOUNT_TYPES = [
  { value: 'transactional', label: 'Transactional (TXN)' },
  { value: 'shared', label: 'Share Capital (SHR)' },
  { value: 'backoffice', label: 'Backoffice (BOF)' },
];

export default function AccountStatements() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [subAccounts, setSubAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('transactional');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyAccount(), getProfile(), getStatement({ limit: 50, accountType })])
      .then(([accountRes, profileRes, stmtRes]) => {
        const data = accountRes.data.data;
        setAccount(data);
        setSubAccounts(data.sub_accounts || []);
        updateUser(profileRes.data.data);
        setStatements(stmtRes.data.data?.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accountType]);

  const isCredit = (type) => ['deposit', 'loan_disbursement'].includes(type);

  const getSubAccount = (type) => subAccounts.find(a => a.account_type === type);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSub = getSubAccount(accountType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Statements"
        subtitle="View your account activity by sub-account"
        action={
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to My Account
          </button>
        }
      />

      {/* Sub-Account Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACCOUNT_TYPES.map(({ value, label }) => {
          const sub = getSubAccount(value);
          const isActive = accountType === value;
          const colorMap = {
            transactional: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
            shared: { border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-700' },
            backoffice: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
          };
          const c = colorMap[value] || colorMap.transactional;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setAccountType(value)}
              className={`rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md ${
                isActive ? `${c.border} ${c.bg} shadow-sm` : 'border-slate-100 bg-white'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${isActive ? c.text : 'text-slate-500'}`}>{label}</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{formatKES(sub?.balance || 0)}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{sub?.account_number || '—'}</p>
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Wallet size={16} className="text-blue-600" />
            Current Balance
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(currentSub?.balance || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp size={16} className="text-green-600" />
            Share Capital
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(currentSub?.shares || account?.shares || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <CreditCard size={16} className="text-amber-600" />
            Account Number
          </div>
          <p className="text-lg font-bold text-slate-800 mt-2 truncate">{currentSub?.account_number || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 flex-1">
            <ReceiptText size={18} className="text-blue-600" />
            Statement Details
          </h3>
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
          <span className="text-xs text-slate-400">{statements.length} transactions</span>
        </div>

        {statements.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No statement entries"
            description="Your account statement will appear here once you start transacting"
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {statements.map((txn) => {
              const credit = isCredit(txn.type);
              return (
                <div key={txn.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${credit ? 'bg-green-100' : 'bg-red-100'}`}>
                    {credit ? (
                      <ArrowDownLeft size={18} className="text-green-600" />
                    ) : (
                      <ArrowUpRight size={18} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-semibold capitalize">{getTxnLabel(txn.type)}</p>
                    <p className="text-slate-400 text-xs truncate">{txn.description || txn.reference || '—'}</p>
                  </div>
                  <div className="hidden md:block">
                    <StatusBadge status={txn.status} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${credit ? 'text-green-600' : 'text-red-500'}`}>
                      {credit ? '+' : '-'}{formatKES(txn.amount)}
                    </p>
                    <p className="text-slate-400 text-xs">{new Date(txn.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}