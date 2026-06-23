import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Download, Filter, Plus, Search, UserPlus, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/ui/index';

const rows = [
  ['John Doe', 'Pending approval', 'Today', 'High'],
  ['Jane Smith', 'KYC review', 'Yesterday', 'Normal'],
  ['Michael Johnson', 'Awaiting documents', '2 days ago', 'High'],
  ['Sarah Williams', 'Profile update', 'This week', 'Normal'],
];

export default function MembershipModule() {
  const [memberCreationOpen, setMemberCreationOpen] = useState(false);
  const [memberListingOpen, setMemberListingOpen] = useState(false);
  const creationRef = useRef(null);
  const listingRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creationRef.current && !creationRef.current.contains(event.target)) {
        setMemberCreationOpen(false);
      }
      if (listingRef.current && !listingRef.current.contains(event.target)) {
        setMemberListingOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const memberCreationOptions = [
    { label: 'Add New Member', value: 'add-new-member', to: '/staff/membership/new' },
  ];

  const memberListingOptions = [
    { label: 'All Members', value: 'all' },
    { label: 'Active Members', value: 'active' },
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Inactive Members', value: 'inactive' },
    { label: 'Suspended Members', value: 'suspended' },
  ];

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

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users size={21} />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400">Module</p>
              <h2 className="font-bold text-slate-800">Membership</h2>
            </div>
          </div>

          <div className="py-4 border-b border-slate-100">
            <p className="text-2xl font-bold text-slate-800">1,284</p>
            <p className="text-sm text-slate-500">active members</p>
          </div>

          <div className="pt-4 border-b border-slate-100 pb-4">
            <p className="text-xs uppercase font-semibold text-slate-400 mb-3">Actions</p>
            
            {/* Member Creation Dropdown */}
            <div className="relative mb-2" ref={creationRef}>
              <button
                onClick={() => {
                  setMemberCreationOpen(!memberCreationOpen);
                  setMemberListingOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:bg-blue-50 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Member Creation</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${memberCreationOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {memberCreationOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                  <div className="py-1">
                    {memberCreationOptions.map((option) => (
                      <Link
                        key={option.value}
                        to={option.to}
                        onClick={() => {
                          setMemberCreationOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Member Listing Dropdown */}
            <div className="relative" ref={listingRef}>
              <button
                onClick={() => {
                  setMemberListingOpen(!memberListingOpen);
                  setMemberCreationOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:bg-blue-50 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Member Listing</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${memberListingOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {memberListingOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                  <div className="py-1">
                    {memberListingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setMemberListingOpen(false);
                          console.log('View:', option.value);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs uppercase font-semibold text-slate-400 mb-3">Queues</p>
            <div className="space-y-2">
              {['Pending applications', 'KYC reviews', 'Member updates'].map((queue, index) => (
                <button
                  key={queue}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-700">{queue}</span>
                  <span className="badge-info">{index + 3}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          {/* Action Bar */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input-field pl-9" placeholder="Search members" />
              </div>
              
              <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Filter size={16} />
                Filter
              </button>
              <button className="inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Download size={16} />
                Export
              </button>
              <button className="btn-primary inline-flex items-center justify-center gap-2">
                <Plus size={16} />
                New
              </button>
            </div>
          </div>

          {/* Work Queue Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Work Queue</h2>
                <p className="text-sm text-slate-500">Member records waiting for staff action.</p>
              </div>
              <span className="badge-warning">Review</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Member Name', 'Status', 'Updated', 'Priority', 'Action'].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map(([name, status, updated, priority]) => (
                    <tr key={name} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">{name}</td>
                      <td className="px-5 py-3 text-slate-600">{status}</td>
                      <td className="px-5 py-3 text-slate-500">{updated}</td>
                      <td className="px-5 py-3">
                        <span className={priority === 'High' ? 'badge-danger' : 'badge-info'}>{priority}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="text-blue-700 font-semibold hover:text-blue-900">Open</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
