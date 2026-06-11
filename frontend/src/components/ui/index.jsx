// Stat Card
export function StatCard({ label, value, sub, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600',   text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-600',  text: 'text-green-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-700' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    text: 'text-red-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-700' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`card-stat p-5 ${c.bg} border border-white`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${c.text} truncate`}>{value}</p>
          {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
              {trend.up ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// LoadingSpinner
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return <div className={`${s} border-3 border-blue-600 border-t-transparent rounded-full animate-spin`} style={{ borderWidth: '3px' }} />;
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-slate-300 mb-4" />}
      <p className="text-slate-600 font-semibold text-lg">{title}</p>
      {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      {action}
    </div>
  );
}

// Page Header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Status badge helper
export function StatusBadge({ status }) {
  const map = {
    completed: 'badge-success',
    active:    'badge-success',
    approved:  'badge-success',
    disbursed: 'badge-info',
    pending:   'badge-warning',
    rejected:  'badge-danger',
    defaulted: 'badge-danger',
    failed:    'badge-danger',
  };
  return <span className={map[status] || 'badge-info'}>{status}</span>;
}

// Amount formatter
export function formatKES(amount) {
  return `KES ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
