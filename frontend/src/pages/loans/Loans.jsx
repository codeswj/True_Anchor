import { useEffect, useState } from 'react';
import { getMyLoans, applyLoan, repayLoan, getMyLoanLimit, getMyGuarantorRequests, respondGuarantor } from '../../api/services';
import { PageHeader, Modal, formatKES, StatusBadge, EmptyState } from '../../components/ui/index';
import { HandCoins, Plus, CheckCircle, XCircle, ChevronRight, Banknote, CreditCard, BadgeInfo, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LOAN_TYPES = ['normal', 'emergency', 'development', 'school_fees'];

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [guarantorRequests, setGuarantorRequests] = useState([]);
  const [loanLimit, setLoanLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [payLoanModal, setPayLoanModal] = useState(false);
  const [loanLimitModal, setLoanLimitModal] = useState(false);
  const [repayModal, setRepayModal] = useState(null);
  const [form, setForm] = useState({ loanType: 'normal', principalAmount: '', loanTermMonths: '', purpose: '' });
  const [repayAmount, setRepayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('loans');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getMyLoans(), getMyLoanLimit(), getMyGuarantorRequests()])
      .then(([lns, limit, grq]) => {
        setLoans(lns.data.data || []);
        setLoanLimit(limit.data.data?.loanLimit || 0);
        setGuarantorRequests(grq.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLoan({ ...form, principalAmount: parseFloat(form.principalAmount), loanTermMonths: parseInt(form.loanTermMonths) });
      toast.success('Loan application submitted!');
      setApplyModal(false);
      setForm({ loanType: 'normal', principalAmount: '', loanTermMonths: '', purpose: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setSubmitting(false); }
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await repayLoan(repayModal.id, { amount: parseFloat(repayAmount) });
      toast.success('Repayment successful!');
      setRepayModal(null);
      setRepayAmount('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Repayment failed');
    } finally { setSubmitting(false); }
  };

  const handleGuarantor = async (loanId, status) => {
    try {
      await respondGuarantor(loanId, { status });
      toast.success(`Guarantor request ${status}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const activeLoans = loans.filter((loan) => ['active', 'disbursed'].includes(loan.status));

  const statusColor = {
    pending: 'border-l-yellow-400', approved: 'border-l-green-400',
    active: 'border-l-blue-500', disbursed: 'border-l-blue-400',
    completed: 'border-l-green-600', rejected: 'border-l-red-400', defaulted: 'border-l-red-600',
  };

  const handlePayLoan = () => {
    if (!activeLoans.length) {
      toast('You do not have an active loan to repay yet.');
      return;
    }
    if (activeLoans.length === 1) {
      setRepayModal(activeLoans[0]);
      return;
    }
    setPayLoanModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans"
        subtitle="Apply, track, and manage your loan portfolio"
        action={
          <button onClick={() => setApplyModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Apply for Loan
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <button
          onClick={() => setApplyModal(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Banknote size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Request Loan</p>
            <p className="text-xs text-slate-500 mt-1">Start a new application</p>
          </div>
        </button>

        <button
          onClick={handlePayLoan}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Pay Loan</p>
            <p className="text-xs text-slate-500 mt-1">Repay an active loan</p>
          </div>
        </button>

        <button
          onClick={() => setLoanLimitModal(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <BadgeInfo size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Check Loan Limit</p>
            <p className="text-xs text-slate-500 mt-1">View your borrowing limit</p>
          </div>
        </button>

        <button
          onClick={() => setTab('guarantor')}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">My Loan Guarantors</p>
            <p className="text-xs text-slate-500 mt-1">Review guarantor requests</p>
          </div>
        </button>
      </div>

      {/* Loan Limit Card */}
      <div className="header-gradient text-white rounded-2xl p-5 shadow-lg">
        <p className="text-blue-200 text-sm">Your Loan Limit</p>
        <p className="text-3xl font-bold mt-1">{formatKES(loanLimit)}</p>
        <p className="text-blue-200 text-xs mt-1">Based on your savings and account history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[['loans', 'My Loans'], ['guarantor', `Guarantor Requests${guarantorRequests.length ? ` (${guarantorRequests.length})` : ''}`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'loans' ? (
        loans.length === 0 ? (
          <EmptyState icon={HandCoins} title="No loans yet" description="Apply for your first loan to get started"
            action={<button onClick={() => setApplyModal(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto"><Plus size={16} /> Apply Now</button>} />
        ) : (
          <div className="grid gap-4">
            {loans.map((loan) => (
              <div key={loan.id}
                className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${statusColor[loan.status] || 'border-l-slate-300'} shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => navigate(`/loans/${loan.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-800 font-bold">{loan.loan_number}</span>
                      <StatusBadge status={loan.status} />
                      <span className="text-xs text-slate-400 capitalize">{loan.loan_type?.replace('_', ' ')}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatKES(loan.principal_amount)}</p>
                    {loan.outstanding_balance != null && (
                      <p className="text-slate-500 text-sm mt-1">Outstanding: <span className="font-semibold text-red-500">{formatKES(loan.outstanding_balance)}</span></p>
                    )}
                    {loan.purpose && <p className="text-slate-400 text-xs mt-1 truncate">{loan.purpose}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-slate-500 text-xs">{loan.loan_term_months} months</p>
                    <p className="text-slate-500 text-xs">{loan.interest_rate}% p.a.</p>
                    {loan.monthly_repayment && <p className="text-blue-600 font-semibold text-sm mt-1">{formatKES(loan.monthly_repayment)}/mo</p>}
                    <ChevronRight size={16} className="text-slate-300 ml-auto mt-2" />
                  </div>
                </div>
                {['active', 'disbursed'].includes(loan.status) && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <button onClick={(e) => { e.stopPropagation(); setRepayModal(loan); }}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Make Repayment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        guarantorRequests.length === 0 ? (
          <EmptyState icon={HandCoins} title="No guarantor requests" description="You haven't been asked to guarantee any loans" />
        ) : (
          <div className="grid gap-4">
            {guarantorRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{req.loan?.loan_number || 'Loan Request'}</p>
                    <p className="text-slate-500 text-sm">{req.loan?.user?.full_name || 'Member'} needs a guarantor</p>
                    <p className="text-slate-400 text-xs mt-1">Amount guaranteed: <span className="font-semibold">{formatKES(req.amount_guaranteed)}</span></p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleGuarantor(req.loan_id, 'accepted')}
                      className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-green-700 transition-colors">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button onClick={() => handleGuarantor(req.loan_id, 'declined')}
                      className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-red-600 transition-colors">
                      <XCircle size={14} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Apply Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Apply for a Loan">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loan Type</label>
            <select className="input-field" value={form.loanType} onChange={(e) => setForm({ ...form, loanType: e.target.value })}>
              {LOAN_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (KES) *</label>
              <input type="number" className="input-field" placeholder="50000" value={form.principalAmount}
                onChange={(e) => setForm({ ...form, principalAmount: e.target.value })} required min="1" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Term (months) *</label>
              <input type="number" className="input-field" placeholder="12" value={form.loanTermMonths}
                onChange={(e) => setForm({ ...form, loanTermMonths: e.target.value })} required min="1" max="60" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Purpose</label>
            <textarea className="input-field resize-none h-20" placeholder="Brief description of loan purpose..."
              value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <strong>Your loan limit:</strong> {formatKES(loanLimit)}. Applying for more than your limit may result in rejection.
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setApplyModal(false)} className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</> : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={payLoanModal} onClose={() => setPayLoanModal(false)} title="Select Loan to Repay">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Choose an active loan to continue with repayment.</p>
          <div className="space-y-2">
            {activeLoans.map((loan) => (
              <button
                key={loan.id}
                onClick={() => {
                  setRepayModal(loan);
                  setPayLoanModal(false);
                }}
                className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{loan.loan_number}</p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{loan.loan_type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatKES(loan.outstanding_balance ?? loan.principal_amount)}</p>
                    <p className="text-xs text-slate-500">Outstanding</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={loanLimitModal} onClose={() => setLoanLimitModal(false)} title="Your Loan Limit">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Current limit</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{formatKES(loanLimit)}</p>
          </div>
          <p className="text-sm text-slate-500">
            Your loan limit is based on your savings and account history. You can request a loan up to this amount, subject to review.
          </p>
          <button onClick={() => setLoanLimitModal(false)} className="btn-primary w-full">
            Close
          </button>
        </div>
      </Modal>

      {/* Repay Modal */}
      <Modal open={!!repayModal} onClose={() => { setRepayModal(null); setRepayAmount(''); }} title="Make Loan Repayment">
        {repayModal && (
          <form onSubmit={handleRepay} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Loan: <span className="font-semibold text-slate-700">{repayModal.loan_number}</span></p>
              <p className="text-xs text-slate-500 mt-1">Outstanding: <span className="font-semibold text-red-500">{formatKES(repayModal.outstanding_balance)}</span></p>
              <p className="text-xs text-slate-500 mt-1">Monthly installment: <span className="font-semibold text-blue-600">{formatKES(repayModal.monthly_repayment)}</span></p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Repayment Amount (KES) *</label>
              <input type="number" className="input-field" placeholder={repayModal.monthly_repayment}
                value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} required min="1" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setRepayModal(null); setRepayAmount(''); }} className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : 'Pay Now'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
