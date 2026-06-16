import { useEffect, useState } from 'react';
import { getGeneralReport, adminListUsers } from '../../api/services';
import { PageHeader, formatKES } from '../../components/ui/index';
import { Users, Wallet, PiggyBank, HandCoins, TrendingUp, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Activity, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#c2185b', '#fbc02d'];

export default function AdminOverview() {
  const [generalData, setGeneralData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGeneralReport({ days: 30 }),
      adminListUsers({ limit: 200 }),
    ]).then(([reportRes, usersRes]) => {
      setGeneralData(reportRes.data.data);
      setMembers(usersRes.data.data?.users || []);
    }).catch(() => toast.error('Failed to load overview data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  const summary = generalData?.summary || {};
  const txns = generalData?.txns || [];
  const loans = generalData?.loans || [];

  // Combined savings = transactional + shared
  const totalSavings = parseFloat(summary.total_savings || 0) + parseFloat(summary.total_share_capital || 0);

  const statCards = [
    { label: 'Total Members', value: summary.total_members, icon: Users, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-600' },
    { label: 'Active Members', value: summary.active_members, icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-600' },
    { label: 'Total Savings', value: formatKES(summary.total_savings), icon: Wallet, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-600', sub: 'Transactional' },
    { label: 'Share Capital', value: formatKES(summary.total_share_capital), icon: PiggyBank, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-600', sub: 'Member shares' },
    { label: 'Total Deposits', value: formatKES(summary.total_deposits), icon: ArrowDownLeft, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-600' },
    { label: 'Total Withdrawals', value: formatKES(summary.total_withdrawals), icon: ArrowUpRight, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-500' },
    { label: 'Total Transfers', value: formatKES(summary.total_transfers), icon: ArrowLeftRight, bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-600' },
    { label: 'Active Loans', value: summary.active_loans, icon: HandCoins, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-600', sub: 'Currently active' },
    { label: 'Loans Disbursed', value: formatKES(summary.total_loans_disbursed), icon: TrendingUp, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-500', sub: 'Total principal' },
    { label: 'Outstanding Loans', value: formatKES(summary.outstanding_loan_balance), icon: DollarSign, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-600', sub: 'Yet to be repaid' },
  ];

  // Members with sub-account breakdown
  const membersWithAccounts = members.filter(m => m.accounts && m.accounts.length > 0);
  const totalTxnBalance = membersWithAccounts.reduce((s, m) => {
    const txn = m.accounts.find(a => a.account_type === 'transactional');
    return s + parseFloat(txn?.balance || 0);
  }, 0);
  const totalShrBalance = membersWithAccounts.reduce((s, m) => {
    const shr = m.accounts.find(a => a.account_type === 'shared');
    return s + parseFloat(shr?.balance || 0);
  }, 0);
  const membersWithLoans = members.filter(m => m.recent_transactions?.some(t => t.type === 'loan_disbursement' || t.type === 'loan_repayment'));

  // Pie data from txns
  const pieData = (txns || []).slice(0, 8).map(t => ({
    name: t.type?.replace(/_/g, ' '),
    value: parseFloat(t.total_amount || 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" subtitle="Complete system overview with detailed analytics" />

      {/* Row 1: Core Member & Financial Stats */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Members & Accounts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {statCards.slice(0, 4).map(({ label, value, icon: Icon, bg, border, text, iconBg, sub }) => (
            <div key={label} className={`${bg} ${border} border rounded-2xl p-4`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              <p className={`text-xl font-bold ${text} truncate`}>{value}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Transaction Stats */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Transaction Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.slice(4, 9).map(({ label, value, icon: Icon, bg, border, text, iconBg, sub }) => (
            <div key={label} className={`${bg} ${border} border rounded-2xl p-4`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              <p className={`text-xl font-bold ${text} truncate`}>{value}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Loan Stats */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Loan Portfolio</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Active Loans', value: summary.active_loans, icon: HandCoins, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-600' },
            { label: 'Total Disbursed', value: formatKES(summary.total_loans_disbursed), icon: TrendingUp, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-500' },
            { label: 'Outstanding', value: formatKES(summary.outstanding_loan_balance), icon: DollarSign, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-600' },
            { label: 'Members with Loans', value: membersWithLoans.length, icon: Users, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', iconBg: 'bg-cyan-600' },
            { label: 'Loan Types', value: loans.length, icon: Activity, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', iconBg: 'bg-slate-600', sub: `${loans.reduce((s, l) => s + parseInt(l.total_applied), 0)} total applications` },
          ].map(({ label, value, icon: Icon, bg, border, text, iconBg, sub }) => (
            <div key={label} className={`${bg} ${border} border rounded-2xl p-4`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              <p className={`text-xl font-bold ${text} truncate`}>{value}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Distribution Pie */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Transaction Volume by Type (30 days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatKES(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Loan Performance Cards */}
        {(loans || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Loan Performance by Type</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loans.map((loan) => (
                <div key={loan.loan_type} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{loan.loan_type}</span>
                    <span className="text-xs text-slate-400">{loan.total_applied} total</span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-1 mb-2">
                    {[
                      { count: loan.approved, color: 'bg-green-500', label: 'Approved' },
                      { count: loan.active, color: 'bg-blue-500', label: 'Active' },
                      { count: loan.completed, color: 'bg-slate-400', label: 'Completed' },
                      { count: loan.defaulted, color: 'bg-red-500', label: 'Defaulted' },
                    ].map(({ count, color, label }) => {
                      const pct = loan.total_applied > 0 ? (count / loan.total_applied) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={label} className="flex-1" title={`${label}: ${count}`}>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(pct, 5)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div><span className="text-green-600 font-bold">{loan.approved}</span> <span className="text-slate-400">Approved</span></div>
                    <div><span className="text-blue-600 font-bold">{loan.active}</span> <span className="text-slate-400">Active</span></div>
                    <div><span className="text-slate-600 font-bold">{loan.completed}</span> <span className="text-slate-400">Done</span></div>
                    <div><span className="text-red-600 font-bold">{loan.defaulted}</span> <span className="text-slate-400">Default</span></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-slate-500">
                    <span>Principal: {formatKES(loan.total_principal)}</span>
                    <span>Outstanding: {formatKES(loan.total_outstanding)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Member Balances Chart */}
      {membersWithAccounts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Member Balances (SHR vs TXN)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={membersWithAccounts.slice(0, 10).map(m => {
              const txn = m.accounts.find(a => a.account_type === 'transactional');
              const shr = m.accounts.find(a => a.account_type === 'shared');
              return {
                name: m.full_name?.split(' ')[0] || '—',
                'Transactional': parseFloat(txn?.balance || 0),
                'Share Capital': parseFloat(shr?.balance || 0),
              };
            })} barSize={18}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={60}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatKES(v)} />
              <Legend />
              <Bar dataKey="Transactional" fill="#1976d2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Share Capital" fill="#388e3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Summary Table */}
      {(txns || []).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Transaction Breakdown by Type</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Type', 'Total Count', 'Total Amount', 'Completed', 'Failed', 'Avg Per Txn'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txns.map((t) => (
                  <tr key={t.type} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700 capitalize">{t.type?.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-slate-600">{t.count}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{formatKES(t.total_amount)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> {t.completed_count}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <XCircle size={10} /> {t.failed_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.count > 0 ? formatKES(parseFloat(t.total_amount) / t.count) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Members Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Members Quick Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Member', 'Phone', 'Member No.', 'Role', 'TXN Balance', 'SHR Balance', 'Status', 'Recent Activity'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.slice(0, 15).map((m) => {
                const txn = m.accounts?.find(a => a.account_type === 'transactional');
                const shr = m.accounts?.find(a => a.account_type === 'shared');
                const recentCount = m.recent_transactions?.length || 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 whitespace-nowrap text-xs">{m.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{m.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.member_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${m.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 text-xs">{formatKES(txn?.balance || 0)}</td>
                    <td className="px-4 py-3 font-semibold text-green-700 text-xs">{formatKES(shr?.balance || 0)}</td>
                    <td className="px-4 py-3">
                      <span className={m.is_active ? 'badge-success' : 'badge-danger'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {recentCount > 0 ? `${recentCount} recent transactions` : 'No activity'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length > 15 && (
            <div className="px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-50">
              Showing 15 of {members.length} members
            </div>
          )}
        </div>
      </div>
    </div>
  );
}