const router                         = require('express').Router();
const ctrl                           = require('../controllers/notification.controller');
const { authenticate }               = require('../middleware/auth.middleware');

router.get('/',    authenticate, ctrl.listNotifications);

module.exports = router;