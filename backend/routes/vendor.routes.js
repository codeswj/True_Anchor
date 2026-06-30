const router = require('express').Router();
const ctrl = require('../controllers/vendor.controller');
const { authenticate, authorizeStaff } = require('../middleware/auth.middleware');

router.post('/',      authenticate, authorizeStaff, ctrl.addVendor);
router.get('/',       authenticate, authorizeStaff, ctrl.listVendors);
router.get('/:id',    authenticate, authorizeStaff, ctrl.getVendor);
router.put('/:id',    authenticate, authorizeStaff, ctrl.updateVendor);
router.delete('/:id', authenticate, authorizeStaff, ctrl.deleteVendor);

module.exports = router;