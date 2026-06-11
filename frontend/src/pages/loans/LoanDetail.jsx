import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoanDetails, repayLoan } from '../../api/services';
import { Modal, formatKES, StatusBadge } from '../../components/ui/index';
import { ArrowLeft, CheckCircle, Calendar, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repayModal, setRepayModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLoanDetails(id)
      .then(res => setLoan(res.data.data))
      .catch(() => navigate('/loans'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRepay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await repayLoan(id, { amount: parseFloat(amount) });
      toast.success('Repayment successful!');
      setRepayModal(false);
      getLoanDetails(id).then(r => setLoan(r.data.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!loan) return null;

  const progress = loan.total_repayable ? Math.min(100, (parseFloat(loan.amount_paid) / parseFloat(loan.total_repayable)) * 100) : 0;

  const details = [
    { label: 'Loan Number', value: loan.loan_number, icon: DollarSign },
    { label: 'Loan Type', value: loan.loan_type?.replace('_', ' '), icon: DollarSign },
    { label: 'Interest Rate', value: `${loan.interest_rate}% p.a.`, icon: Percent },
    { label: 'Term', value: `${loan.loan_term_months} months`, icon: Calendar },
    { label: 'Applied On', value: new Date(loan.applied_at).toLocaleDateString(), icon: Calendar },
    { label: 'Due Date', value: loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—', icon: Calendar },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/loans')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Loans
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{loan.loan_number}</h1>
              <StatusBadge status={loan.status} />
            </div>
            <p className="text-slate-400 text-sm capitalize">{loan.loan_type?.replace('_', ' ')} Loan</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Principal', value: formatKES(loan.principal_amount), color: 'text-slate-800' },
            { label: 'Total Repayable', value: formatKES(loan.total_repayable), color: 'text-slate-800' },
            { label: 'Outstanding', value: formatKES(loan.outstanding_balance), color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={`font-bold text-base ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Repayment Progress</span>
            <span>{progress.toFixed(0)}% — Paid {formatKES(loan.amount_paid)}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {['active', 'disbursed'].includes(loan.status) && (
          <button onClick={() => setRepayModal(true)} className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <CheckCircle size={16} /> Make Repayment
          </button>
        )}
      </div>

      {/* Details Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-4">Loan Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {details.map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-0.5">{label}</p>
              <p className="text-slate-800 font-semibold text-sm capitalize">{value}</p>
            </div>
          ))}
        </div>
        {loan.purpose && (
          <div className="mt-4 bg-slate-50 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Purpose</p>
            <p className="text-slate-700 text-sm">{loan.purpose}</p>
          </div>
        )}
        {loan.rejection_reason && (
          <div className="mt-4 bg-red-50 rounded-xl p-4">
            <p className="text-red-400 text-xs mb-1">Rejection Reason</p>
            <p className="text-red-700 text-sm">{loan.rejection_reason}</p>
          </div>
        )}
      </div>

      <Modal open={repayModal} onClose={() => setRepayModal(false)} title="Make Repayment">
        <form onSubmit={handleRepay} className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 text-sm">
            Monthly installment: <span className="font-bold text-blue-700">{formatKES(loan.monthly_repayment)}</span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
            <input type="number" className="input-field" placeholder={loan.monthly_repayment}
              value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setRepayModal(false)} className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Pay Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
