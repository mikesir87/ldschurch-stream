const Unit = require('../models/Unit');
const User = require('../models/User');
const InviteToken = require('../models/InviteToken');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/errorHandler');
const youtubeBatchProcessor = require('../jobs/youtubeBatchProcessor');

const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find({ isActive: true }).sort({ name: 1 });
    res.json(units);
  } catch (error) {
    next(error);
  }
};

const createUnit = async (req, res, next) => {
  try {
    const { name, subdomain } = req.body;

    const unit = await Unit.create({
      name: name.trim(),
      subdomain: subdomain.toLowerCase().trim(),
    });

    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};

const createInviteToken = async (req, res, next) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours

    const inviteToken = await InviteToken.create({
      token,
      unitId,
      createdBy: req.user.id,
      expiresAt,
    });

    res.status(201).json({
      token: inviteToken.token,
      expiresAt: inviteToken.expiresAt,
      inviteUrl: `${req.protocol}://${req.get('host')}/invite/${token}`,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .populate('units', 'name subdomain')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const triggerYoutubeBatch = async (req, res, next) => {
  try {
    await youtubeBatchProcessor.processPendingStreams();
    res.json({ message: 'YouTube batch processing completed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnits,
  createUnit,
  createInviteToken,
  getUsers,
  triggerYoutubeBatch,
};
