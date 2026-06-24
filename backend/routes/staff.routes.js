const router = require('express').Router();
const ctrl = require('../controllers/staff.controller');
const { authenticate, authorizeStaff } = require('../middleware/auth.middleware');

router.post('/members/onboard', authenticate, authorizeStaff, ctrl.onboardMember);
router.get('/members',          authenticate, authorizeStaff, ctrl.listMembers);
router.get('/members/:id',      authenticate, authorizeStaff, ctrl.getMember);

module.exports = router;