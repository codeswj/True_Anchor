import { useEffect, useState } from 'react';
import { getMessages, markRead, markAllRead, deleteMessage } from '../../api/services';
import { PageHeader, EmptyState } from '../../components/ui/index';
import { MessageSquare, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    getMessages()
      .then(res => setMessages(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (id) => {
    try { await markRead(id); fetchMessages(); } catch {}
  };

  const handleMarkAllRead = async () => {
    try { await markAllRead(); fetchMessages(); toast.success('All messages marked as read'); } catch {}
  };

  const handleDelete = async (id) => {
    try { await deleteMessage(id); fetchMessages(); toast.success('Message deleted'); } catch {}
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Messages"
        subtitle={unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All caught up!'}
        action={unread > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      />

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages" description="You'll see notifications and messages from IloviaCapital here" />
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition-all cursor-pointer ${!msg.is_read ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'}`}
              onClick={() => !msg.is_read && handleMarkRead(msg.id)}>
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${!msg.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!msg.is_read ? 'text-slate-900' : 'text-slate-700'}`}>{msg.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                      className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{msg.body}</p>
                  <p className="text-slate-400 text-xs mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
