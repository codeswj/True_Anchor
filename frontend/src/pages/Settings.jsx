import { useState, useEffect } from 'react';
import { changePin, getProfile } from '../api/services';
import { PageHeader, formatKES } from '../components/ui/index';
import { Lock, Eye, EyeOff, User, Phone, Mail, Shield, Hash, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data.data);
        updateUser(res.data.data);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (form.newPin !== form.confirmPin) return toast.error('New PINs do not match');
    if (form.newPin.length < 4) return toast.error('PIN must be at least 4 digits');
    setLoading(true);
    try {
      await changePin({ oldPin: form.oldPin, newPin: form.newPin });
      toast.success('PIN changed successfully');
      setForm({ oldPin: '', newPin: '', confirmPin: '' });
      setShowFields(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change PIN');
    } finally { setLoading(false); }
  };

  if (profileLoading) return (
    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  const p = profile || user;

  const infoFields = [
    { label: 'Full Name', value: p?.full_name, icon: User },
    { label: 'Phone Number', value: p?.phone, icon: Phone },
    { label: 'Email', value: p?.email || 'Not set', icon: Mail },
    { label: 'Member Number', value: p?.member_number || '—', icon: Hash },
    { label: 'National ID', value: p?.id_number || 'Not set', icon: Shield },
    { label: 'Role', value: p?.role, icon: Shield },
    { label: 'Member Since', value: p?.created_at ? new Date(p.created_at).toLocaleDateString() : '—', icon: Calendar },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account & security" />

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {p?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IC'}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{p?.full_name}</h2>
              <p className="text-blue-200 text-sm">{p?.phone}</p>
              <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full capitalize">{p?.role}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Profile Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoFields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-700 text-sm truncate">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Management Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">PIN Security</h3>
          </div>
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle size={12} />
            PIN Set
          </span>
        </div>

        {/* Current PIN Display */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current PIN</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-slate-700 font-mono tracking-widest">
                  {showCurrentPin ? (p?._pin || '****') : '••••'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCurrentPin(!showCurrentPin)}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              {showCurrentPin ? <EyeOff size={16} /> : <Eye size={16} />}
              {showCurrentPin ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Your PIN is securely hashed and cannot be retrieved. You can only change it by providing your current PIN.
          </p>
        </div>

        {!showFields ? (
          <button
            type="button"
            onClick={() => setShowFields(true)}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            <Lock size={16} />
            Change PIN
          </button>
        ) : (
          <form onSubmit={handleChangePin} className="space-y-4">
            {[
              { key: 'oldPin', label: 'Current PIN', placeholder: 'Enter current PIN' },
              { key: 'newPin', label: 'New PIN', placeholder: 'Enter new PIN (min 4 digits)' },
              { key: 'confirmPin', label: 'Confirm New PIN', placeholder: 'Re-enter new PIN' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    className="input-field pl-9"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    required
                    minLength={4}
                    maxLength={8}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowFields(false); setForm({ oldPin: '', newPin: '', confirmPin: '' }); }}
                className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Changing…</>
                ) : (
                  'Update PIN'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}