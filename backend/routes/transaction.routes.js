const router           = require('express').Router();
const ctrl             = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get ('/statement',           authenticate, ctrl.getStatement);
router.post('/deposit',             authenticate, ctrl.deposit);
router.post('/withdraw',            authenticate, ctrl.withdraw);
router.post('/bank-transfer',       authenticate, ctrl.bankTransfer);
router.post('/mobile-money-transfer', authenticate, ctrl.mobileMoneyTransfer);
router.post('/savings-transfer',    authenticate, ctrl.savingsTransfer);
router.post('/internal-transfer',   authenticate, ctrl.internalTransfer);
router.post('/buy-airtime',         authenticate, ctrl.buyAirtime);
router.post('/pay-utility',         authenticate, ctrl.payUtility);

module.exports = router;