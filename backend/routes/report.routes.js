const router                           = require('express').Router();
const ctrl                             = require('../controllers/report.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

router.get('/general',   authenticate, authorizeAdmin, ctrl.generalReport);
router.get('/members',   authenticate, authorizeAdmin, ctrl.membersList);
router.get('/members/:id', authenticate, authorizeAdmin, ctrl.memberReport);

module.exports = router;