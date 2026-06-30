import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PiggyBank, Wallet, HandCoins, Landmark, Search, Download, Filter, Phone, Mail, Hash, User, Calendar, Shield } from 'lucide-react';
import { PageHeader, formatKES, Modal } from '../../components/ui/index';
import { staffListMembers, staffGetMember } from '../../api/services';

const accountTypeMeta = {
  shared: { label: 'Share Capital', icon: PiggyBank, gradient: 'from-green-500 to-emerald-600', border: 'border-green-200', lightBg: 'bg-green-50', textColor: 'text-green-700' },
  transactional: { label: 'Transactional', icon: Wallet, gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-200', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
  loans: { label: 'Loans', icon: HandCoins, gradient: 'from-purple-500 to-violet-600', border: 'border-purple-200', lightBg: 'bg-purple-50', textColor: 'text-purple-700' },
  savings: { label: 'Savings', icon: Landmark, gradient: 'from-orange-500 to-amber-600', border: 'border-orange-200', lightBg: 'bg-orange-50', textColor: 'text-orange-700' },
};

const accountTypeIcons = { shared: PiggyBank, transactional: Wallet, loans: HandCoins, savings: Landmark };
const accountTypeGradients = { shared: 'from-green-500 to-emerald-600', transactional: 'from-blue-500 to-indigo-600', loans: 'from-purple-500 to-violet-600', savings: 'from-orange-500 to-amber-600' };

export default function SavingsModule() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await staffListMembers();
      setMembers(res.data.data?.members || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const openMemberModal = async (memberId) => {
    try {
      setModalLoading(true);
      const res = await staffGetMember(memberId);
      setSelectedMember(res.data.data || null);
    } catch (err) {
      console.error('Failed to fetch member details:', err);
      setSelectedMember(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Compute totals per account type
  const totals = { shared: 0, transactional: 0, loans: 0, savings: 0 };
  members.forEach((m) => {
    (m.accounts || []).forEach((acc) => {
      if (totals[acc.account_type] !== undefined) {
        totals[acc.account_type] += parseFloat(acc.balance || 0);
      }
    });
  });

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.full_name && m.full_name.toLowerCase().includes(term)) ||
      (m.member_number && m.member_number.toLowerCase().includes(term)) ||
      (m.phone && m.phone.includes(term))
    );
  });

  const getAccountForType = (accounts, type) => {
    return (accounts || []).find((a) => a.account_type === type);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings"
        subtitle="Member accounts overview — shares, transactional, loans, and savings."
        action={
          <Link to="/staff" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Staff Portal
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(accountTypeMeta).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={type} className={`rounded-xl border ${meta.border} ${meta.lightBg} shadow-sm p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">{meta.label}</p>
                  <p className={`text-lg font-bold ${meta.textColor}`}>{formatKES(totals[type])}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800">Member Accounts</h2>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading...' : `${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-9 py-2 text-sm w-64"
                  placeholder="Search by name, number or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Filter size={16} />
                Filter
              </button>
              <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-green-600 uppercase tracking-wider">Shares (5)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider">Transactional (2)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider">Loans (3)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-orange-600 uppercase tracking-wider">Savings (4)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading member accounts...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {searchTerm ? 'No members match your search.' : 'No members found.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const shared = getAccountForType(member.accounts, 'shared');
                  const transactional = getAccountForType(member.accounts, 'transactional');
                  const loans = getAccountForType(member.accounts, 'loans');
                  const savings = getAccountForType(member.accounts, 'savings');

                  return (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700">{member.full_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">{member.member_number || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{member.phone || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-green-700 font-semibold">{formatKES(shared?.balance || 0)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{shared?.account_number || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-blue-700 font-semibold">{formatKES(transactional?.balance || 0)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{transactional?.account_number || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-purple-700 font-semibold">{formatKES(loans?.balance || 0)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{loans?.account_number || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-orange-700 font-semibold">{formatKES(savings?.balance || 0)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{savings?.account_number || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openMemberModal(member.id)}
                          className="text-blue-700 font-semibold text-xs hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      <Modal open={!!selectedMember || modalLoading} onClose={() => setSelectedMember(null)} title="Member Details" size="xl">
        {modalLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : selectedMember ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <User size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Full Name</p>
                    <p className="font-semibold text-slate-800">{selectedMember.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Hash size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Member Number</p>
                    <p className="font-semibold text-slate-800 font-mono">{selectedMember.member_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Phone size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-800">{selectedMember.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Mail size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="font-semibold text-slate-800">{selectedMember.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Hash size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">ID Number</p>
                    <p className="font-semibold text-slate-800">{selectedMember.id_number || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Calendar size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Member Since</p>
                    <p className="font-semibold text-slate-800">{formatDate(selectedMember.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <Shield size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className={`font-semibold ${selectedMember.is_active ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedMember.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {selectedMember.kra_pin && (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <Hash size={18} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">KRA PIN</p>
                      <p className="font-semibold text-slate-800">{selectedMember.kra_pin}</p>
                    </div>
                  </div>
                )}
                {selectedMember.date_of_birth && (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <Calendar size={18} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Date of Birth</p>
                      <p className="font-semibold text-slate-800">{formatDate(selectedMember.date_of_birth)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Accounts */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Sub-Accounts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(selectedMember.accounts || []).map((acc) => {
                  const Icon = accountTypeIcons[acc.account_type] || Wallet;
                  const gradient = accountTypeGradients[acc.account_type] || 'from-slate-500 to-slate-600';
                  const meta = accountTypeMeta[acc.account_type];
                  return (
                    <div key={acc.id} className={`rounded-xl border ${meta?.border || 'border-slate-200'} ${meta?.lightBg || 'bg-slate-50'} p-4`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-400">{meta?.label || acc.account_type}</p>
                          <p className="text-sm font-mono text-slate-500">{acc.account_number}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-slate-400">Balance</p>
                          <p className={`text-lg font-bold ${meta?.textColor || 'text-slate-700'}`}>{formatKES(acc.balance)}</p>
                        </div>
                        {acc.account_type === 'shared' && (
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Shares</p>
                            <p className="text-sm font-bold text-green-700">{formatKES(acc.shares)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Profile Info */}
            {(selectedMember.gender || selectedMember.marital_status || selectedMember.physical_address) && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Additional Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedMember.gender && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400">Gender</p>
                      <p className="font-semibold text-slate-800 capitalize">{selectedMember.gender}</p>
                    </div>
                  )}
                  {selectedMember.marital_status && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400">Marital Status</p>
                      <p className="font-semibold text-slate-800 capitalize">{selectedMember.marital_status}</p>
                    </div>
                  )}
                  {selectedMember.physical_address && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400">Physical Address</p>
                      <p className="font-semibold text-slate-800">{selectedMember.physical_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">Failed to load member details.</div>
        )}
      </Modal>
    </div>
  );
}