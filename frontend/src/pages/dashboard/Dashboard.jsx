import { useEffect, useState } from 'react';
import { getMyAccount, getStatement, getMyLoans, getMyLoanLimit } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { StatCard, formatKES, StatusBadge } from '../../components/ui/index';
import { Wallet, TrendingUp, HandCoins, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loanLimit, setLoanLimit] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyAccount(),
      getStatement({ limit: 10 }),
      getMyLoans(),
      getMyLoanLimit(),
    ]).then(([acc, stmt, lns, limit]) => {
      setAccount(acc.data.data);
      setTxns(stmt.data.data?.transactions || []);
      setLoans(lns.data.data || []);
      setLoanLimit(limit.data.data?.loanLimit || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build sparkline data from last 7 transactions
  const chartData = txns.slice(0, 7).reverse().map((t, i) => ({
    name: `T${i + 1}`,
    balance: parseFloat(t.balance_after || 0),
  }));

  const activeLoans = loans.filter(l => ['active', 'disbursed'].includes(l.status));

  const quickActions = [
    { label: 'Deposit', icon: ArrowDownLeft, color: 'bg-green-500', to: '/transactions?tab=deposit' },
    { label: 'Withdraw', icon: ArrowUpRight, color: 'bg-red-500', to: '/transactions?tab=withdraw' },
    { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-blue-500', to: '/transactions?tab=transfer' },
    { label: 'Loans', icon: HandCoins, color: 'bg-purple-500', to: '/loans' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Balance Hero Card */}
      <div className="relative overflow-hidden rounded-2xl header-gradient text-white p-6 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Account Balance</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-4xl font-bold">
                  {hideBalance ? '••••••' : formatKES(account?.balance)}
                </p>
                <button onClick={() => setHideBalance(!hideBalance)} className="text-blue-200 hover:text-white">
                  {hideBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-blue-200 text-xs mt-1">{account?.account_number}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Share Capital</p>
              <p className="text-white font-bold text-lg">{formatKES(account?.shares)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {quickActions.map(({ label, icon: Icon, color, to }) => (
              <button key={label} onClick={() => navigate(to)}
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Savings Balance" value={formatKES(account?.balance)} icon={Wallet} color="blue" />
        <StatCard label="Share Capital" value={formatKES(account?.shares)} icon={TrendingUp} color="green" />
        <StatCard label="Loan Limit" value={formatKES(loanLimit)} icon={HandCoins} color="purple" />
        <StatCard label="Active Loans" value={activeLoans.length} sub={activeLoans.length === 0 ? 'No active loans' : `${activeLoans.length} loan(s)`} icon={HandCoins} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Balance Trend</h3>
              <p className="text-slate-400 text-xs">Last {chartData.length} transactions</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => formatKES(v)} labelFormatter={(l) => `Transaction ${l}`} />
                <Area type="monotone" dataKey="balance" stroke="#1976d2" strokeWidth={2.5}
                  fill="url(#colorBal)" dot={{ r: 3, fill: '#1976d2' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No transaction data yet</div>
          )}
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Active Loans</h3>
            <button onClick={() => navigate('/loans')} className="text-blue-600 text-xs font-semibold hover:underline">View all</button>
          </div>
          {activeLoans.length === 0 ? (
            <div className="text-center py-8">
              <HandCoins size={36} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No active loans</p>
              <button onClick={() => navigate('/loans')} className="mt-3 text-blue-600 text-xs font-semibold hover:underline">Apply for a loan</button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="bg-slate-50 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => navigate(`/loans/${loan.id}`)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">{loan.loan_number}</span>
                    <StatusBadge status={loan.status} />
                  </div>
                  <p className="text-slate-800 font-bold text-sm">{formatKES(loan.outstanding_balance)}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Outstanding</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} className="text-blue-600 text-xs font-semibold hover:underline">View all</button>
        </div>
        <div className="divide-y divide-slate-50">
          {txns.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No transactions yet</div>
          ) : txns.slice(0, 6).map((txn) => {
            const isCredit = ['deposit', 'loan_disbursement'].includes(txn.type);
            return (
              <div key={txn.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCredit
                    ? <ArrowDownLeft size={16} className="text-green-600" />
                    : <ArrowUpRight size={16} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm font-medium capitalize truncate">{txn.type?.replace('_', ' ')}</p>
                  <p className="text-slate-400 text-xs truncate">{txn.description || txn.reference || '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}{formatKES(txn.amount)}
                  </p>
                  <p className="text-slate-400 text-xs">{new Date(txn.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
