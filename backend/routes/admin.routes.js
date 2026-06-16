const router                           = require('express').Router();
const ctrl                             = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

router.get('/users',     authenticate, authorizeAdmin, ctrl.listUsers);
router.get('/users/:id', authenticate, authorizeAdmin, ctrl.getUser);

module.exports = router;