const express = require('express');
const router = express.Router();
const unitsController = require('../controllers/units');
const { authenticateToken, authorizeUnit } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:unitId/streams', authorizeUnit, unitsController.getStreams);
router.post('/:unitId/streams', authorizeUnit, unitsController.createStream);
router.put('/:unitId/streams/:streamId', authorizeUnit, unitsController.updateStream);
router.get('/:unitId/attendance', authorizeUnit, unitsController.getAttendance);

module.exports = router;
