import { useEffect, useState } from 'react';
import { getGeneralReport, getMembersReport, getMemberReportById } from '../../api/services';
import { PageHeader, formatKES, Modal } from '../../components/ui/index';
import { BarChart3, Users, Wallet, PiggyBank, HandCoins, TrendingUp, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronDown, Phone, Calendar, Eye, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const REPORT_TABS = [
  { key: 'general', label: '📊 General Report', desc: 'System-wide performance & analytics' },
  { key: 'member',  label: '👤 Member Report', desc: 'Member-specific performance & activity' },
];

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#c2185b', '#fbc02d'];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('general');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [generalData, setGeneralData] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'general') {
      loadGeneralReport();
    } else {
      loadMembersList();
    }
  }, [activeTab]);

  const loadGeneralReport = async () => {
    setLoading(true);
    try {
      const res = await getGeneralReport({ days: 30 });
      setGeneralData(res.data.data);
    } catch (err) {
      toast.error('Failed to load general report');
    } finally {
      setLoading(false);
    }
  };

  const loadMembersList = async () => {
    setLoading(true);
    try {
      const res = await getMembersReport();
      setMembersList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load members list');
    } finally {
      setLoading(false);
    }
  };

  const openMemberDetail = async (member) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setMemberDetail(null);
    try {
      const res = await getMemberReportById(member.id);
      setMemberDetail(res.data.data);
    } catch (err) {
      toast.error('Failed to load member report');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredMembers = membersList.filter(m => {
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    return m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q) || m.member_number?.toLowerCase().includes(q);
  });

  // ── General Report UI ──
  const renderGeneralReport = () => {
    if (!generalData) return null;
    const { summary, volume, loans, txns } = generalData;

    // Pie data for transaction distribution
    const pieData = (txns || []).slice(0, 8).map(t => ({
      name: t.type?.replace(/_/g, ' '),
      value: parseFloat(t.total_amount),
    }));

    const statCards = [
      { label: 'Total Members', value: summary?.total_members, icon: Users, color: 'blue' },
      { label: 'Active Members', value: summary?.active_members, icon: Users, color: 'green' },
      { label: 'Total Savings', value: formatKES(summary?.total_savings), icon: Wallet, color: 'blue' },
      { label: 'Share Capital', value: formatKES(summary?.total_share_capital), icon: PiggyBank, color: 'green' },
      { label: 'Total Deposits', value: formatKES(summary?.total_deposits), icon: ArrowDownLeft, color: 'green' },
      { label: 'Total Withdrawals', value: formatKES(summary?.total_withdrawals), icon: ArrowUpRight, color: 'red' },
      { label: 'Total Transfers', value: formatKES(summary?.total_transfers), icon: ArrowLeftRight, color: 'blue' },
      { label: 'Active Loans', value: summary?.active_loans, icon: HandCoins, color: 'purple' },
      { label: 'Loans Disbursed', value: formatKES(summary?.total_loans_disbursed), icon: TrendingUp, color: 'orange' },
      { label: 'Outstanding Loans', value: formatKES(summary?.outstanding_loan_balance), icon: HandCoins, color: 'red' },
    ];

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => {
            const colorMap = {
              blue: 'bg-blue-50 border-blue-200 text-blue-700',
              green: 'bg-green-50 border-green-200 text-green-700',
              red: 'bg-red-50 border-red-200 text-red-700',
              purple: 'bg-purple-50 border-purple-200 text-purple-700',
              orange: 'bg-orange-50 border-orange-200 text-orange-700',
            };
            return (
              <div key={label} className={`${colorMap[color] || colorMap.blue} border rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} />
                  <span className="text-xs font-semibold uppercase">{label}</span>
                </div>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Distribution Pie */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Transaction Volume by Type (30 days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatKES(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Loan Stats */}
          {(loans || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Loan Performance by Type</h3>
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div key={loan.loan_type} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700 capitalize">{loan.loan_type}</span>
                      <span className="text-xs text-slate-400">{loan.total_applied} applications</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div><span className="text-green-600 font-semibold">{loan.approved}</span> Approved</div>
                      <div><span className="text-blue-600 font-semibold">{loan.active}</span> Active</div>
                      <div><span className="text-slate-600 font-semibold">{loan.completed}</span> Completed</div>
                      <div><span className="text-red-600 font-semibold">{loan.defaulted}</span> Defaulted</div>
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

        {/* Transaction Summary Table */}
        {(txns || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Transaction Summary by Type (All Time)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Type', 'Total Count', 'Total Amount', 'Completed', 'Failed'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {txns.map((t) => (
                    <tr key={t.type} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700 capitalize">{t.type?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-3 text-slate-600">{t.count}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{formatKES(t.total_amount)}</td>
                      <td className="px-5 py-3"><span className="badge-success">{t.completed_count}</span></td>
                      <td className="px-5 py-3"><span className="badge-danger">{t.failed_count}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Member Report UI ──
  const renderMemberReport = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by name, phone, member number..."
          className="input-field pl-11" value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)} />
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Member Reports</h3>
          <span className="text-xs text-slate-400">{filteredMembers.length} members</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Member', 'Phone', 'Member No.', 'Savings', 'Shares', 'Deposited', 'Withdrawn', 'Active Loans', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 whitespace-nowrap">{m.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{m.member_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatKES(m.savings_balance)}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{formatKES(m.share_balance)}</td>
                    <td className="px-4 py-3 text-green-600">{formatKES(m.total_deposited)}</td>
                    <td className="px-4 py-3 text-red-500">{formatKES(m.total_withdrawn)}</td>
                    <td className="px-4 py-3">{m.active_loans_count > 0 ? <span className="badge-warning">{m.active_loans_count}</span> : <span className="text-slate-400">0</span>}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openMemberDetail(m)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold">
                        <Eye size={14} /> View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setMemberDetail(null); }}
        title={memberDetail?.full_name || 'Member Report'} size="xl">
        {detailLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : memberDetail ? (
          <div className="space-y-6">
            {/* Profile */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  {memberDetail.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{memberDetail.full_name}</h3>
                  <p className="text-sm text-slate-500">{memberDetail.phone} {memberDetail.email ? `| ${memberDetail.email}` : ''}</p>
                  <p className="text-xs text-slate-400">Member: {memberDetail.member_number} | ID: {memberDetail.id_number || '—'}</p>
                </div>
                <div className="ml-auto">
                  <span className={memberDetail.is_active ? 'badge-success' : 'badge-danger'}>
                    {memberDetail.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Sub-Accounts</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(memberDetail.accounts || []).map((acc) => {
                  const colors = {
                    shared: { bg: 'bg-green-50 border-green-200 text-green-700' },
                    transactional: { bg: 'bg-blue-50 border-blue-200 text-blue-700' },
                    backoffice: { bg: 'bg-purple-50 border-purple-200 text-purple-700' },
                  };
                  const c = colors[acc.account_type] || colors.transactional;
                  return (
                    <div key={acc.account_number} className={`${c.bg} border rounded-2xl p-4`}>
                      <p className="text-xs font-bold uppercase">{acc.account_type}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{acc.account_number}</p>
                      <p className="text-xl font-bold mt-2">{formatKES(acc.balance)}</p>
                      {acc.account_type === 'shared' && <p className="text-xs text-slate-500">Shares: {formatKES(acc.shares)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transaction Summary */}
            {memberDetail.transaction_summary && Object.keys(memberDetail.transaction_summary).length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Transaction Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Deposits', value: memberDetail.transaction_summary.total_deposits, color: 'text-green-600' },
                    { label: 'Withdrawals', value: memberDetail.transaction_summary.total_withdrawals, color: 'text-red-500' },
                    { label: 'Transfers', value: memberDetail.transaction_summary.total_transfers, color: 'text-blue-600' },
                    { label: 'Loan Repayments', value: memberDetail.transaction_summary.total_loan_repayments, color: 'text-purple-600' },
                    { label: 'Savings Transfers', value: memberDetail.transaction_summary.total_savings_transfers, color: 'text-green-600' },
                    { label: 'Total Txns', value: memberDetail.transaction_summary.transaction_count, color: 'text-slate-700', isCount: true },
                  ].map(({ label, value, color, isCount }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-lg font-bold mt-1 ${color}`}>{isCount ? value : formatKES(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loans */}
            {(memberDetail.loans || []).length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Loans</h4>
                <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {(memberDetail.loans || []).map((loan) => (
                    <div key={loan.loan_number} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{loan.loan_number} <span className="capitalize text-slate-400 font-normal">({loan.loan_type})</span></p>
                        <p className="text-xs text-slate-400">{new Date(loan.applied_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatKES(loan.principal_amount)}</p>
                        <p className="text-xs text-slate-500">Outstanding: {formatKES(loan.outstanding_balance)}</p>
                      </div>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                        loan.status === 'active' || loan.status === 'disbursed' ? 'bg-blue-100 text-blue-700' :
                        loan.status === 'defaulted' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{loan.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">Failed to load member report</div>
        )}
      </Modal>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Analytics & performance reports" />

      {/* Dropdown Toggle */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          {REPORT_TABS.find(t => t.key === activeTab)?.label || 'Select Report'}
          <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden">
            {REPORT_TABS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setDropdownOpen(false); setMemberSearch(''); }}
                className={`w-full text-left px-5 py-3.5 transition-colors hover:bg-slate-50 ${activeTab === key ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : activeTab === 'general' ? renderGeneralReport() : renderMemberReport()}
    </div>
  );
}