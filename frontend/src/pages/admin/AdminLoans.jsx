import { useEffect, useState } from 'react';
import { approveLoan, rejectLoan, disburseLoan } from '../../api/services';
import { PageHeader, formatKES, StatusBadge, Modal } from '../../components/ui/index';
import { CheckCircle, XCircle, Send, HandCoins } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = () => {
    setLoading(true);
    // Admin gets all loans via a general endpoint - using accounts route as workaround
    api.get('/loans/admin/all').then(res => setLoans(res.data.data || [])).catch(() => setLoans([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const filtered = loans.filter(l => filter === 'all' ? true : l.status === filter);

  const handleApprove = async (id) => {
    try { await approveLoan(id); toast.success('Loan approved'); fetchLoans(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await rejectLoan(rejectModal, { reason }); toast.success('Loan rejected'); setRejectModal(null); setReason(''); fetchLoans(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDisburse = async (id) => {
    try { await disburseLoan(id); toast.success('Loan disbursed'); fetchLoans(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const STATUSES = ['all', 'pending', 'approved', 'disbursed', 'active', 'completed', 'rejected'];

  return (
    <div className="space-y-6">
      <PageHeader title="Loan Management" subtitle="Review and action member loan applications" />

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-14 text-center">
          <HandCoins size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No {filter} loans</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Loan #', 'Member', 'Amount', 'Type', 'Term', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{loan.loan_number}</td>
                    <td className="px-4 py-3 text-slate-600">{loan.user?.full_name || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatKES(loan.principal_amount)}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{loan.loan_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-500">{loan.loan_term_months}mo</td>
                    <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                    <td className="px-4 py-3 text-slate-400">{new Date(loan.applied_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {loan.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(loan.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Approve">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => setRejectModal(loan.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors" title="Reject">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <button onClick={() => handleDisburse(loan.id)} className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" title="Disburse">
                            <Send size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setReason(''); }} title="Reject Loan">
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rejection Reason *</label>
            <textarea className="input-field resize-none h-24" placeholder="Provide a clear reason for rejection..."
              value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setRejectModal(null); setReason(''); }} className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Rejecting…</> : 'Reject Loan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
