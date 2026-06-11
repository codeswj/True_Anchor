import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Phone, Lock, User, Mail, CreditCard } from 'lucide-react';
import logo from '../../assets/ilovia-capital-logo.jpg';

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', pin: '', confirmPin: '', email: '', idNumber: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.pin !== form.confirmPin) return toast.error('PINs do not match');
    if (form.pin.length < 4) return toast.error('PIN must be at least 4 digits');
    setLoading(true);
    try {
      const res = await register({ fullName: form.fullName, phone: form.phone, pin: form.pin, email: form.email || undefined, idNumber: form.idNumber || undefined });
      const { token, user } = res.data.data;
      loginUser(token, user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe', required: true },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '07XX XXX XXX', required: true },
    { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'john@example.com' },
    { key: 'idNumber', label: 'National ID Number', icon: CreditCard, type: 'text', placeholder: '12345678' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-xl">
        <div className="mb-7 flex justify-center">
          <img
            src={logo}
            alt="Ilovia Capital"
            className="h-14 w-auto max-w-72 rounded-lg object-contain shadow-lg"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-slate-400 text-sm mb-7">Join IloviaCapital and start saving today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ key, label, icon: Icon, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={type} className="input-field pl-9" placeholder={placeholder}
                      value={form[key]} onChange={set(key)} required={required} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">PIN <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={show ? 'text' : 'password'} className="input-field pl-9 pr-10"
                    placeholder="Min 4 digits" value={form.pin} onChange={set('pin')} required />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm PIN <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={show ? 'text' : 'password'} className="input-field pl-9"
                    placeholder="Repeat PIN" value={form.confirmPin} onChange={set('confirmPin')} required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already a member? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
