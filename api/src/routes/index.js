const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/admin', require('./admin'));
router.use('/units', require('./units'));
router.use('/public', require('./public'));
router.use('/obs-proxy', require('./obsProxy'));

module.exports = router;
