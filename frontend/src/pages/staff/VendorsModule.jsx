import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Plus, Search, Store, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/index';
import { listVendors } from '../../api/services';

export default function VendorsModule() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await listVendors();
      setVendors(res.data.data?.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.vendor_name?.toLowerCase().includes(term) ||
      v.contact_person?.toLowerCase().includes(term) ||
      v.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        subtitle="Manage vendors, supplier details, and contact information."
        action={
          <Link to="/staff/payables" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Payables
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Search vendors..."
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
          <Link
            to="/staff/payables/vendors/new"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Vendor
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Vendor List</h2>
            <p className="text-sm text-slate-500">{filteredVendors.length} vendor(s) registered.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Vendor No', 'Vendor Name', 'Contact Person', 'Phone', 'Email', 'Status', 'Action'].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <Store size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No vendors found</p>
                      <p className="text-sm">Add a vendor to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-sm text-slate-500">{vendor.vendor_number}</td>
                      <td className="px-5 py-3 font-semibold text-slate-700">{vendor.vendor_name}</td>
                      <td className="px-5 py-3 text-slate-600">{vendor.contact_person || '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{vendor.phone}</td>
                      <td className="px-5 py-3 text-slate-600">{vendor.email || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={vendor.status === 'active' ? 'badge-success' : 'badge-danger'}>
                          {vendor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate(`/staff/payables/vendors/${vendor.id}`)}
                          className="text-blue-700 font-semibold hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}