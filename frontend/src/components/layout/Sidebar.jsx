import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, HandCoins,
  MessageSquare, Settings, LogOut, Users, BarChart3,
  X
} from 'lucide-react';
import logo from '../../assets/ilovia-capital-logo.jpg';

const NAV_MEMBER = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transact' },
  { to: '/account', icon: CreditCard, label: 'My Account' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const NAV_ADMIN = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/loans', icon: HandCoins, label: 'Loan Requests' },
  { to: '/admin/members', icon: Users, label: 'Members' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'admin' ? NAV_ADMIN : NAV_MEMBER;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IC';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 sidebar-gradient z-30 flex flex-col
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Ilovia Capital"
              className="h-11 w-auto max-w-44 rounded-lg object-contain shadow-lg"
            />
            <button className="ml-auto md:hidden text-white" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{user?.full_name || 'Member'}</p>
              <p className="text-blue-200 text-xs truncate">{user?.member_number || user?.phone || ''}</p>
            </div>
            {user?.role === 'admin' && (
              <span className="ml-auto flex-shrink-0 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-bold">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {user?.role === 'admin' && (
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Admin</p>
          )}
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white text-blue-800 shadow-md'
                  : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
