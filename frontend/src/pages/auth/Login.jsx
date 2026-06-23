import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import logo from '../../assets/ilovia-capital-logo.jpg';

function homeForRole(role) {
  const normalizedRole = String(role || 'member').trim().toLowerCase();
  if (normalizedRole === 'admin') return '/admin';
  if (normalizedRole === 'staff') return '/staff';
  return '/dashboard';
}

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', pin: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      // Save the PIN so user can see it in Settings
      user._pin = form.pin;
      loginUser(token, user);
      toast.success('Welcome back!');
      navigate(homeForRole(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 sidebar-gradient flex-col justify-between p-12">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Ilovia Capital"
            className="h-14 w-auto max-w-64 rounded-lg object-contain shadow-xl"
          />
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Your savings,<br />your future.
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Access your account, apply for loans, and manage your finances — all in one secure place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Active Members', value: '5,000+' },
              { label: 'Loans Disbursed', value: 'KES 50M+' },
              { label: 'Savings Held', value: 'KES 120M+' },
              { label: 'Years Serving', value: '15+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-blue-200 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">© 2025 IloviaCapital. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 md:hidden">
            <img
              src={logo}
              alt="Ilovia Capital"
              className="h-12 w-auto max-w-56 rounded-lg object-contain shadow-md"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign In</h2>
            <p className="text-slate-400 text-sm mb-7">Enter your phone and PIN to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    className="input-field pl-9"
                    placeholder="07XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">PIN</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    className="input-field pl-9 pr-10"
                    placeholder="Enter your PIN"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Not a member?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
