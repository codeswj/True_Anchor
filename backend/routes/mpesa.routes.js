const router           = require('express').Router();
const ctrl             = require('../controllers/mpesa.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/stk-push',              authenticate, ctrl.stkPush);
router.post('/callback',                            ctrl.callback);   // No auth — Safaricom hits this
router.get ('/status/:checkoutRequestId', authenticate, ctrl.checkStatus);

module.exports = router;
