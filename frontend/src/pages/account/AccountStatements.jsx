import { useEffect, useState } from 'react';
import { getMyAccount, getProfile, getStatement } from '../../api/services';
import { PageHeader, formatKES, StatusBadge, EmptyState } from '../../components/ui/index';
import { ArrowLeft, ReceiptText, Wallet, TrendingUp, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getTxnLabel = (type) => {
  if (type === 'internal_transfer') return 'mobile money transfer';
  if (type === 'savings_transfer') return 'savings transfer';
  return type?.replace(/_/g, ' ');
};

export default function AccountStatements() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAccount(), getProfile(), getStatement({ limit: 50 })])
      .then(([accountRes, profileRes, stmtRes]) => {
        setAccount(accountRes.data.data);
        updateUser(profileRes.data.data);
        setStatements(stmtRes.data.data?.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [updateUser]);

  const isCredit = (type) => ['deposit', 'loan_disbursement'].includes(type);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Statements"
        subtitle="View your account activity and balances"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Wallet size={16} className="text-blue-600" />
            Current Balance
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(account?.balance)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp size={16} className="text-green-600" />
            Share Capital
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(account?.shares)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <CreditCard size={16} className="text-amber-600" />
            Account Number
          </div>
          <p className="text-lg font-bold text-slate-800 mt-2 truncate">{account?.account_number || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ReceiptText size={18} className="text-blue-600" />
            Statement Details
          </h3>
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
