import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteVendor } from '../../api/services';
import { ArrowLeft, Store, User, Phone, Mail, MapPin, FileText, BadgeCheck, Clock, Edit, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/index';
import { getVendor } from '../../api/services';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await getVendor(id);
      setVendor(res.data.data);
    } catch (err) {
      console.error('Failed to fetch vendor:', err);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Vendor Not Found"
          subtitle="The vendor you are looking for does not exist."
          action={
            <Link to="/staff/payables/vendors" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
              <ArrowLeft size={16} />
              Vendors
            </Link>
          }
        />
      </div>
    );
  }

  const infoCards = [
    { icon: Store, label: 'Vendor No', value: vendor.vendor_number },
    { icon: User, label: 'Contact Person', value: vendor.contact_person || 'Not provided' },
    { icon: Phone, label: 'Phone', value: vendor.phone },
    { icon: Mail, label: 'Email', value: vendor.email || 'Not provided' },
    { icon: FileText, label: 'KRA PIN', value: vendor.kra_pin || 'Not provided' },
    { icon: Clock, label: 'Payment Terms', value: vendor.payment_terms ? vendor.payment_terms.replace('net', 'Net ') : 'Not set' },
    { icon: MapPin, label: 'Physical Address', value: vendor.physical_address || 'Not provided' },
    { icon: BadgeCheck, label: 'Status', value: vendor.status === 'active' ? 'Active' : 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={vendor.vendor_name}
        subtitle="Full vendor/supplier details and information."
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/staff/payables/vendors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft size={16} />
              Vendors
            </Link>
          </div>
        }
      />

      {/* Vendor Info Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <Store size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{vendor.vendor_name}</h2>
            <p className="text-sm text-slate-500">Vendor details and contact information</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {infoCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-200">
                <Icon size={18} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      {vendor.notes && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Notes</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{vendor.notes}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Link
          to={`/staff/payables/vendors/${vendor.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Edit size={16} />
          Edit Vendor
        </Link>
        <button
          onClick={async () => {
            if (!window.confirm('Are you sure you want to delete this vendor?')) return;
            try {
              await deleteVendor(vendor.id);
              toast.success('Vendor deleted successfully');
              navigate('/staff/payables/vendors');
            } catch (err) {
              toast.error('Failed to delete vendor');
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
          Delete Vendor
        </button>
      </div>
    </div>
  );
}