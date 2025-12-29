const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authenticateToken, requireGlobalAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireGlobalAdmin);

router.get('/units', adminController.getUnits);
router.post('/units', adminController.createUnit);
router.post('/units/:unitId/invite', adminController.createInviteToken);
router.get('/users', adminController.getUsers);
router.post('/youtube/batch', adminController.triggerYoutubeBatch);

module.exports = router;
