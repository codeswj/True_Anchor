const router                        = require('express').Router();
const ctrl                          = require('../controllers/account.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

router.get('/',         authenticate, ctrl.getMyAccount);
router.get('/balance',  authenticate, ctrl.getBalance);
router.get('/all',      authenticate, authorizeAdmin, ctrl.listAccounts);

module.exports = router;
