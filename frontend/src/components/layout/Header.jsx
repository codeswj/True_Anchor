import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../../api/services';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount()
      .then(res => setUnread(res.data.data?.count || 0))
      .catch(() => {});
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4">
      <button
        className="md:hidden text-slate-600 hover:text-slate-800"
        onClick={onMenuToggle}
      >
        <Menu size={22} />
      </button>

      <div className="flex-1">
        <h2 className="text-slate-800 font-semibold text-base leading-none">
          {getGreeting()}, <span className="text-blue-700">{user?.full_name?.split(' ')[0] || 'Member'}</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-52">
        <Search size={15} className="text-slate-400" />
        <input className="bg-transparent text-sm outline-none w-full text-slate-600 placeholder:text-slate-400" placeholder="Search..." />
      </div>

      <button
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        onClick={() => navigate('/messages')}
      >
        <Bell size={20} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </header>
  );
}
