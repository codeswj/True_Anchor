import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Plus, Search } from 'lucide-react';
import { PageHeader } from '../../components/ui/index';
import { staffListMembers } from '../../api/services';

export default function MembershipModule() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.full_name && m.full_name.toLowerCase().includes(term)) ||
      (m.member_number && m.member_number.toLowerCase().includes(term)) ||
      (m.phone && m.phone.includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (isActive) => {
    return isActive
      ? <span className="badge-info">Active</span>
      : <span className="badge-danger">Inactive</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership"
        subtitle="Member onboarding, profiles, approvals, and status reviews."
        action={
          <Link to="/staff" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Staff Portal
          </Link>
        }
      />

      <section className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Search members by name, number, phone or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Filter size={16} />
              Filter
            </button>
            <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download size={16} />
              Export
            </button>
            <Link to="/staff/membership/new" className="btn-primary inline-flex items-center justify-center gap-2">
              <Plus size={16} />
              New
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">All Members</h2>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading...' : `${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <span className="badge-warning">{loading ? '...' : members.length} Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Member Name', 'Member No.', 'Phone', 'Status', 'Joined', 'Action'].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      {searchTerm ? 'No members match your search.' : 'No members found. Click "New" to add the first member.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">{member.full_name}</td>
                      <td className="px-5 py-3 text-slate-600 font-mono text-xs">{member.member_number || '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{member.phone || '—'}</td>
                      <td className="px-5 py-3">{getStatusBadge(member.is_active)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(member.created_at)}</td>
                      <td className="px-5 py-3">
                        <Link
                          to={`/staff/members/${member.id}`}
                          className="text-blue-700 font-semibold hover:text-blue-900"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
