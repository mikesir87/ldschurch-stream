const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/register-with-invite', authController.registerWithInvite);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
