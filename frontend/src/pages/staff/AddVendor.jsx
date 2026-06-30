import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Store, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/index';
import { createVendor } from '../../api/services';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function AddVendor() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

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
      const res = await createVendor(payload);
      toast.success(res.data?.message || 'Vendor added successfully');
      event.target.reset();
      navigate('/staff/payables/vendors');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add vendor';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Vendor"
        subtitle="Register a new vendor or supplier."
        action={
          <Link to="/staff/payables/vendors" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Vendors
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
            <p className="text-sm text-slate-500">Fill in the supplier/vendor details.</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Vendor Name">
            <input name="vendorName" type="text" className="input-field" placeholder="Vendor or company name" required />
          </Field>

          <Field label="Contact Person">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="contactPerson" type="text" className="input-field pl-9" placeholder="Contact person name" />
            </div>
          </Field>

          <Field label="Phone Number">
            <input name="phone" type="tel" className="input-field" placeholder="07XX XXX XXX" required />
          </Field>

          <Field label="Email">
            <input name="email" type="email" className="input-field" placeholder="vendor@example.com" />
          </Field>

          <Field label="KRA PIN">
            <input name="kraPin" type="text" className="input-field" placeholder="KRA PIN" />
          </Field>

          <Field label="Payment Terms">
            <select name="paymentTerms" className="input-field" defaultValue="">
              <option value="" disabled>Select terms</option>
              <option value="immediate">Immediate</option>
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net60">Net 60</option>
            </select>
          </Field>

          <Field label="Physical Address">
            <input name="address" type="text" className="input-field" placeholder="Physical address" />
          </Field>

          <Field label="Status">
            <select name="status" className="input-field" defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Notes / Description">
              <textarea name="notes" rows={3} className="input-field resize-none" placeholder="Optional notes about this vendor..." />
            </Field>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Link
            to="/staff/payables/vendors"
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
            {saving ? 'Saving…' : 'Save Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}