import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Upload, UserPlus, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/index';
import { staffOnboardMember } from '../../api/services';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function FileField({ label, name }) {
  return (
    <Field label={label}>
      <div className="relative rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white text-blue-700 flex items-center justify-center border border-slate-100">
            <Upload size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">Upload file</p>
            <p className="text-xs text-slate-500">PNG, JPG, or PDF</p>
          </div>
        </div>
        <input
          name={name}
          type="file"
          accept="image/*,.pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
    </Field>
  );
}

export default function AddNewMember() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showNextOfKin, setShowNextOfKin] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.target);
    const payload = {
      fullName: formData.get('name'),
      phone: formData.get('mobileNumber'),
      pin: formData.get('pin') || '0000',
      idNumber: formData.get('idNumber'),
      email: formData.get('email'),
      kraPin: formData.get('kraPin'),
      maritalStatus: formData.get('maritalStatus'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      physicalAddress: formData.get('physicalAddress'),
    };

    // Next of kin fields (optional)
    const nokName = formData.get('nokName');
    if (nokName) {
      payload.nextOfKin = {
        name: nokName,
        idNumber: formData.get('nokIdNumber'),
        relationship: formData.get('nokRelationship'),
        phone: formData.get('nokPhone'),
        percentage: formData.get('nokPercentage') ? parseFloat(formData.get('nokPercentage')) : 0,
      };
    }

    try {
      const res = await staffOnboardMember(payload);
      toast.success(res.data?.message || 'Member onboarded successfully');
      event.target.reset();
      navigate('/staff/membership');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to onboard member';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Member"
        subtitle="Capture member identity, contact details, and uploaded documents."
        action={
          <Link to="/staff/membership" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft size={16} />
            Membership
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <UserPlus size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Member Information</h2>
            <p className="text-sm text-slate-500">Fill in the required profile details.</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <input name="name" type="text" className="input-field" placeholder="Full name" required />
          </Field>

          <Field label="ID No">
            <input name="idNumber" type="text" className="input-field" placeholder="National ID number" required />
          </Field>

          <Field label="Mobile No">
            <input name="mobileNumber" type="tel" className="input-field" placeholder="07XX XXX XXX" required />
          </Field>

          <Field label="PIN">
            <input name="pin" type="password" className="input-field" placeholder="Default: 0000" />
          </Field>

          <Field label="KRA PIN">
            <input name="kraPin" type="text" className="input-field" placeholder="KRA PIN" />
          </Field>

          <Field label="Marital Status">
            <select name="maritalStatus" className="input-field" defaultValue="">
              <option value="" disabled>Select marital status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </Field>

          <Field label="Email">
            <input name="email" type="email" className="input-field" placeholder="member@example.com" />
          </Field>

          <Field label="Date of Birth">
            <input name="dateOfBirth" type="date" className="input-field" />
          </Field>

          <Field label="Membership Number">
            <input name="membershipNumber" type="text" className="input-field" placeholder="Membership number" />
          </Field>

          <Field label="Gender">
            <select name="gender" className="input-field" defaultValue="">
              <option value="" disabled>Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Physical Address">
            <input name="physicalAddress" type="text" className="input-field" placeholder="Physical address" />
          </Field>

          <FileField label="Signature" name="signature" />
          <FileField label="Passport Photo" name="passportPhoto" />
        </div>

        {/* Next of Kin Section */}
        <div className="border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowNextOfKin(!showNextOfKin)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users size={21} />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-slate-800">Next of Kin</h2>
                <p className="text-sm text-slate-500">Optionally add next of kin registration details.</p>
              </div>
            </div>
            {showNextOfKin ? (
              <ChevronDown size={20} className="text-slate-400" />
            ) : (
              <ChevronRight size={20} className="text-slate-400" />
            )}
          </button>

          {showNextOfKin && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <Field label="Name">
                <input name="nokName" type="text" className="input-field" placeholder="Next of kin full name" />
              </Field>

              <Field label="ID No">
                <input name="nokIdNumber" type="text" className="input-field" placeholder="National ID number" />
              </Field>

              <Field label="Relationship">
                <select name="nokRelationship" className="input-field" defaultValue="">
                  <option value="" disabled>Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Phone Number">
                <input name="nokPhone" type="tel" className="input-field" placeholder="07XX XXX XXX" />
              </Field>

              <Field label="Percentage (%)">
                <input
                  name="nokPercentage"
                  type="number"
                  className="input-field"
                  placeholder="e.g. 100"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Link
            to="/staff/membership"
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
            {saving ? 'Saving…' : 'Save Member'}
          </button>
        </div>
      </form>
    </div>
  );
}