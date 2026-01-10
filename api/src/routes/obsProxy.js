const express = require('express');
const router = express.Router();
const ObsAccessCode = require('../models/ObsAccessCode');
const { AppError } = require('../middleware/errorHandler');

const validateAccessCode = async (req, res, next) => {
  try {
    const { accessCode } = req.params;

    const obsAccess = await ObsAccessCode.findOne({
      accessCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate('unitId', 'name');

    if (!obsAccess) {
      throw new AppError('Invalid or expired access code', 404);
    }

    res.json({
      valid: true,
      unitName: obsAccess.unitId.name,
    });
  } catch (error) {
    next(error);
  }
};

router.get('/validate/:accessCode', validateAccessCode);

module.exports = router;
