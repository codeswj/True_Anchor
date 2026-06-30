import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Search } from 'lucide-react';
import { PageHeader, StatCard } from '../../components/ui/index';
import { staffModules, staffShortcuts } from './staffModules';

const colorClasses = {
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  green: 'bg-green-50 border-green-100 text-green-700',
  orange: 'bg-orange-50 border-orange-100 text-orange-700',
  purple: 'bg-purple-50 border-purple-100 text-purple-700',
};

export default function StaffPortal() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Portal"
        subtitle="Back-office workspace for operations, finance, assets, inventory, and reporting"
        action={
          <div className="relative w-64 hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search workspaces" />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {staffShortcuts.map(({ label, value, icon: Icon, color }) => (
          <StatCard key={label} label={label} value={value} icon={Icon} color={color} />
        ))}
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Workspaces</h2>
              <p className="text-sm text-slate-500">Choose a workspace to review queues and records.</p>
            </div>
            <span className="badge-info">{staffModules.length} active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 p-5">
            {staffModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.slug}
                  to={`/staff/${module.slug}`}
                  className="group border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorClasses[module.color]}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 truncate">{module.title}</h3>
                        <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 leading-5">{module.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-800">{module.metric}</p>
                      <p className="text-xs text-slate-400">{module.metricLabel}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      Open
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Today</h2>
            <div className="space-y-3">
              {[
                ['Member approvals', '8 pending'],
                ['Loan appraisals', '14 waiting'],
                ['Payment vouchers', '5 due'],
                ['Inventory review', '18 low-stock items'],
              ].map(([label, detail]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Clock3 size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Controls</h2>
            <div className="space-y-3">
              {['Maker-checker approvals', 'Audit trail enabled', 'Monthly close open'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}