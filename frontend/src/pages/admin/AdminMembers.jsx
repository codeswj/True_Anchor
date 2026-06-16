import { useEffect, useState } from 'react';
import { adminListUsers, adminGetUser } from '../../api/services';
import { PageHeader, formatKES, Modal, StatusBadge } from '../../components/ui/index';
import { Users, Wallet, PiggyBank, Building2, ArrowDownLeft, ArrowUpRight, Phone, Mail, Hash, Shield, Calendar, Search, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCOUNT_COLORS = {
  shared: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: PiggyBank },
  transactional: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Wallet },
  backoffice: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Building2 },
};

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    adminListUsers({ limit: 200 })
      .then(res => setUsers(res.data.data?.users || []))
      .catch(err => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  const openUserDetail = async (user) => {
    setSelectedUser(user);
    setDetailLoading(true);
    setUserDetail(null);
    try {
      const res = await adminGetUser(user.id);
      setUserDetail(res.data.data);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const getTxnLabel = (type) => {
    if (type === 'internal_transfer') return 'mobile money transfer';
    if (type === 'savings_transfer') return 'savings transfer';
    return type?.replace(/_/g, ' ');
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.member_number?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id_number?.includes(q)
    );
  });

  const totalBalance = users.reduce((s, u) => {
    const txAcc = u.accounts?.find(a => a.account_type === 'transactional');
    return s + parseFloat(txAcc?.balance || 0);
  }, 0);
  const totalShares = users.reduce((s, u) => {
    const shAcc = u.accounts?.find(a => a.account_type === 'shared');
    return s + parseFloat(shAcc?.balance || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Members" subtitle="View all members, their sub-accounts and activity" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users size={16} className="text-blue-600" />
            Total Members
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Wallet size={16} className="text-blue-600" />
            Total Savings
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(totalBalance)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <PiggyBank size={16} className="text-green-600" />
            Total Share Capital
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatKES(totalShares)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield size={16} className="text-purple-600" />
            Active Members
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{users.filter(u => u.is_active).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, member number..."
          className="input-field pl-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">All Members</h3>
          <span className="text-xs text-slate-400">{filteredUsers.length} of {users.length} members</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Member', 'Phone', 'Email', 'ID No.', 'Member No.', 'Role', 'Sub-Accounts', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 whitespace-nowrap">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{user.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{user.id_number || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{user.member_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(user.accounts || []).map((acc) => {
                          const colors = {
                            shared: 'bg-green-100 text-green-700',
                            transactional: 'bg-blue-100 text-blue-700',
                            backoffice: 'bg-purple-100 text-purple-700',
                          };
                          return (
                            <span key={acc.id} className={`text-xs px-1.5 py-0.5 rounded ${colors[acc.account_type] || 'bg-slate-100 text-slate-600'}`}>
                              {acc.account_type?.slice(0, 4)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.is_active ? 'badge-success' : 'badge-danger'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openUserDetail(user)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal open={!!selectedUser} onClose={() => { setSelectedUser(null); setUserDetail(null); }}
        title={selectedUser?.full_name || 'Member Details'} size="xl">
        {detailLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : userDetail ? (
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  {userDetail.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{userDetail.full_name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Phone size={12} /> {userDetail.phone}</span>
                    {userDetail.email && <span className="flex items-center gap-1"><Mail size={12} /> {userDetail.email}</span>}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className={userDetail.is_active ? 'badge-success' : 'badge-danger'}>
                    {userDetail.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${userDetail.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'}`}>
                    {userDetail.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Member Number</p>
                  <p className="font-semibold text-slate-700">{userDetail.member_number || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">National ID</p>
                  <p className="font-semibold text-slate-700">{userDetail.id_number || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Joined</p>
                  <p className="font-semibold text-slate-700">{new Date(userDetail.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Sub-Accounts */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Sub-Accounts</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(userDetail.accounts || []).map((acc) => {
                  const c = ACCOUNT_COLORS[acc.account_type] || ACCOUNT_COLORS.transactional;
                  const Icon = c.icon;
                  return (
                    <div key={acc.id} className={`${c.bg} ${c.border} border rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className={c.text} />
                        <span className={`text-xs font-bold uppercase ${c.text}`}>{acc.account_type}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mb-2">{acc.account_number}</p>
                      <p className="text-xl font-bold text-slate-800">{formatKES(acc.balance)}</p>
                      {acc.account_type === 'shared' && (
                        <p className="text-xs text-slate-500 mt-1">Shares: {formatKES(acc.shares)}</p>
                      )}
                      <span className={acc.is_active ? 'badge-success' : 'badge-danger'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {acc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Recent Activity</h4>
              {(userDetail.recent_transactions || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No transactions yet</div>
              ) : (
                <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {(userDetail.recent_transactions || []).map((txn) => {
                    const isCredit = ['deposit', 'loan_disbursement'].includes(txn.type);
                    return (
                      <div key={txn.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                          {isCredit ? <ArrowDownLeft size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 text-sm font-medium capitalize">{getTxnLabel(txn.type)}</p>
                          <p className="text-slate-400 text-xs truncate">{txn.description || txn.reference || '—'}</p>
                        </div>
                        <div className="hidden sm:block">
                          <StatusBadge status={txn.status} />
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
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">Failed to load member details</div>
        )}
      </Modal>
    </div>
  );
}