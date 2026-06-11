const router           = require('express').Router();
const ctrl             = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get ('/',              authenticate, ctrl.getMessages);
router.get ('/unread-count',  authenticate, ctrl.getUnreadCount);
router.put ('/mark-all-read', authenticate, ctrl.markAllRead);
router.put ('/:id/read',      authenticate, ctrl.markRead);
router.delete('/:id',         authenticate, ctrl.deleteMessage);

module.exports = router;
