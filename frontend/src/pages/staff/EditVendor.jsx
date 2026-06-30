import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Store, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/index';
import { getVendor, updateVendor } from '../../api/services';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await getVendor(id);
      setVendor(res.data.data);
    } catch (err) {
      toast.error('Failed to load vendor details');
      navigate('/staff/payables/vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.target);
    const payload = {
      vendorName: formData.get('vendorName'),
      contactPerson: formData.get('contactPerson'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      kraPin: formData.get('kraPin'),
      paymentTerms: formData.get('paymentTerms'),
      physicalAddress: formData.get('address'),
      status: formData.get('status'),
      notes: formData.get('notes'),
    };

    try {
      const res = await updateVendor(id, payload);
      toast.success(res.data?.message || 'Vendor updated successfully');
      navigate(`/staff/payables/vendors/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update vendor';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${vendor.vendor_name}`}
        subtitle="Update vendor or supplier details."
        action={
          <Link to={`/staff/payables/vendors/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <Store size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Vendor Information</h2>
            <p className="text-sm text-slate-500">
              Vendor No: <span className="font-semibold">{vendor.vendor_number}</span>
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Vendor Name">
            <input name="vendorName" type="text" className="input-field" placeholder="Vendor or company name" required defaultValue={vendor.vendor_name} />
          </Field>

          <Field label="Contact Person">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="contactPerson" type="text" className="input-field pl-9" placeholder="Contact person name" defaultValue={vendor.contact_person || ''} />
            </div>
          </Field>

          <Field label="Phone Number">
            <input name="phone" type="tel" className="input-field" placeholder="07XX XXX XXX" required defaultValue={vendor.phone} />
          </Field>

          <Field label="Email">
            <input name="email" type="email" className="input-field" placeholder="vendor@example.com" defaultValue={vendor.email || ''} />
          </Field>

          <Field label="KRA PIN">
            <input name="kraPin" type="text" className="input-field" placeholder="KRA PIN" defaultValue={vendor.kra_pin || ''} />
          </Field>

          <Field label="Payment Terms">
            <select name="paymentTerms" className="input-field" defaultValue={vendor.payment_terms || ''}>
              <option value="" disabled>Select terms</option>
              <option value="immediate">Immediate</option>
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net60">Net 60</option>
            </select>
          </Field>

          <Field label="Physical Address">
            <input name="address" type="text" className="input-field" placeholder="Physical address" defaultValue={vendor.physical_address || ''} />
          </Field>

          <Field label="Status">
            <select name="status" className="input-field" defaultValue={vendor.status || 'active'}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Notes / Description">
              <textarea name="notes" rows={3} className="input-field resize-none" placeholder="Optional notes about this vendor..." defaultValue={vendor.notes || ''} />
            </Field>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Link
            to={`/staff/payables/vendors/${id}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Update Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}