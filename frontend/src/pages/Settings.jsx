import { useState } from 'react';
import { changePin } from '../api/services';
import { PageHeader } from '../components/ui/index';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [form, setForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change PIN');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account security" />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Change PIN</h3>
        </div>
        <form onSubmit={handleChangePin} className="space-y-4">
          {[
            { key: 'oldPin', label: 'Current PIN' },
            { key: 'newPin', label: 'New PIN' },
            { key: 'confirmPin', label: 'Confirm New PIN' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={show ? 'text' : 'password'} className="input-field pl-9 pr-10"
                  placeholder="••••" value={form[key]} onChange={set(key)} required />
                {key === 'oldPin' && (
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 py-2.5 disabled:opacity-60">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Changing…</> : 'Change PIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
