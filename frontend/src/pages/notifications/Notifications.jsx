import { useEffect, useState } from 'react';
import { getNotifications } from '../../api/services';
import { PageHeader, EmptyState, formatKES } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, ArrowLeftRight, HandCoins, UserPlus, Megaphone, RefreshCw, Circle, CreditCard, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  message: { icon: Mail, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Message' },
  transaction: { icon: ArrowLeftRight, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Transaction' },
  loan: { icon: HandCoins, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Loan' },
  member_registration: { icon: UserPlus, bg: 'bg-green-100', text: 'text-green-700', label: 'New Member' },
  system_message: { icon: Megaphone, bg: 'bg-orange-100', text: 'text-orange-700', label: 'System' },
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then(res => setNotifications(res.data.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const filteredNotifs = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.notification_type === filter);

  const types = [...new Set(notifications.map(n => n.notification_type))];

  const isUnread = (n) => n.is_read === false;
  const unreadCount = notifications.filter(isUnread).length;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        action={
          <button onClick={fetchNotifications} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All ({notifications.length})
        </button>
        {types.map(type => {
          const cfg = TYPE_CONFIG[type] || { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-700', label: type };
          const count = notifications.filter(n => n.notification_type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${filter === type ? `${cfg.bg} ${cfg.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <cfg.icon size={12} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filteredNotifs.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="System activity will appear here" />
      ) : (
        <div className="space-y-2">
          {filteredNotifs.map((notif, idx) => {
            const cfg = TYPE_CONFIG[notif.notification_type] || { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-700', label: 'Update' };
            const IconComponent = cfg.icon;
            const unread = isUnread(notif);
            const isAdmin = user?.role === 'admin';

            return (
              <div
                key={`${notif.notification_type}-${notif.id}-${idx}`}
                className={`bg-white rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md ${unread ? 'border-blue-300 bg-blue-50/40' : 'border-slate-100'}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={18} className={cfg.text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${cfg.text}`}>{cfg.label}</span>
                        {unread && <Circle size={6} className="text-blue-500 fill-blue-500" />}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className={`text-sm font-semibold mt-0.5 ${unread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.description}</p>

                    {/* Related user info for admin */}
                    {isAdmin && notif.related_user_name && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <UserPlus size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">{notif.related_user_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}