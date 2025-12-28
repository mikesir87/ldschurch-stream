const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public');

router.get('/:subdomain/current-stream', publicController.getCurrentStream);
router.post('/:subdomain/attend', publicController.submitAttendance);
router.get('/:subdomain/unit-info', publicController.getUnitInfo);

module.exports = router;
