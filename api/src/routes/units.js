const express = require('express');
const router = express.Router();
const unitsController = require('../controllers/units');
const { authenticateToken, authorizeUnit } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', unitsController.getUserUnits);
router.get('/:unitId/streams', authorizeUnit, unitsController.getStreams);
router.post('/:unitId/streams', authorizeUnit, unitsController.createStream);
router.put('/:unitId/streams/:streamId', authorizeUnit, unitsController.updateStream);
router.delete('/:unitId/streams/:streamId', authorizeUnit, unitsController.deleteStream);
router.get('/:unitId/attendance', authorizeUnit, unitsController.getAttendance);
router.get('/:unitId/attendance/trends', authorizeUnit, unitsController.getAttendanceTrends);
router.get('/:unitId/settings', authorizeUnit, unitsController.getUnitSettings);
router.put('/:unitId/settings', authorizeUnit, unitsController.updateUnitSettings);
router.post(
  '/:unitId/streams/:streamId/obs-access',
  authorizeUnit,
  unitsController.createObsAccess
);
router.delete(
  '/:unitId/streams/:streamId/obs-access',
  authorizeUnit,
  unitsController.revokeObsAccess
);

module.exports = router;
