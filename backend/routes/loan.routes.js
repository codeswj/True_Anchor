const router                           = require('express').Router();
const ctrl                             = require('../controllers/loan.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// Member routes
router.post('/',                        authenticate, ctrl.applyLoan);
router.get ('/',                        authenticate, ctrl.getMyLoans);
router.get ('/limit',                   authenticate, ctrl.getMyLoanLimit);
router.get ('/guarantor-requests',      authenticate, ctrl.getMyGuarantorRequests);
router.get ('/:id',                     authenticate, ctrl.getLoanDetails);
router.post('/:id/repay',               authenticate, ctrl.repayLoan);
router.put ('/guarantor/:loanId/respond', authenticate, ctrl.respondGuarantor);

// Admin routes
router.put ('/:id/approve',  authenticate, authorizeAdmin, ctrl.approveLoan);
router.put ('/:id/reject',   authenticate, authorizeAdmin, ctrl.rejectLoan);
router.put ('/:id/disburse', authenticate, authorizeAdmin, ctrl.disburseLoan);

module.exports = router;
