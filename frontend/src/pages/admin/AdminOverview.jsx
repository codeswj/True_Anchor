import { useEffect, useState } from 'react';
import { listAccounts, getStatement } from '../../api/services';
import { StatCard, formatKES, PageHeader } from '../../components/ui/index';
import { Users, Wallet, ArrowLeftRight, HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminOverview() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAccounts({ limit: 50 })
      .then(res => setAccounts(res.data.data?.accounts || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
  const totalShares  = accounts.reduce((s, a) => s + parseFloat(a.shares || 0), 0);

  // Simple distribution chart
  const chartData = accounts.slice(0, 8).map((a) => ({
    name: a.account_number?.replace('ACC-', '#'),
    balance: parseFloat(a.balance || 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" subtitle="System-wide summary" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={accounts.length} icon={Users} color="blue" />
        <StatCard label="Total Savings" value={formatKES(totalBalance)} icon={Wallet} color="green" />
        <StatCard label="Total Share Capital" value={formatKES(totalShares)} icon={ArrowLeftRight} color="purple" />
        <StatCard label="Active Accounts" value={accounts.filter(a => a.is_active).length} icon={HandCoins} color="orange" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">Member Balances (Top 8)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={30}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatKES(v)} />
              <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#1976d2' : '#42a5f5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">No data yet</div>
        )}
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">All Members</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Account No.', 'Member', 'Phone', 'Balance', 'Shares', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{acc.account_number}</td>
                    <td className="px-5 py-3 text-slate-600">{acc.user?.full_name || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{acc.user?.phone || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{formatKES(acc.balance)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatKES(acc.shares)}</td>
                    <td className="px-5 py-3">
                      <span className={acc.is_active ? 'badge-success' : 'badge-danger'}>
                        {acc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
