const Unit = require('../models/Unit');
const User = require('../models/User');
const InviteToken = require('../models/InviteToken');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/errorHandler');
const youtubeBatchProcessor = require('../jobs/youtubeBatchProcessor');
const reportGenerator = require('../jobs/reportGenerator');
const { setupTestData } = require('../scripts/setupTestReportData');
const emailService = require('../services/emailService');

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
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email address is required', 400, 'EMAIL_REQUIRED');
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours

    const inviteToken = await InviteToken.create({
      token,
      email,
      unitId,
      createdBy: req.user.id,
      expiresAt,
    });

    const inviteUrl = `${req.protocol}://dashboard.${req.get('host').replace('api.', '')}/invite/${token}`;

    // Send invite email
    await emailService.sendInviteEmail(email, {
      token,
      unitName: unit.name,
      inviteUrl,
      expiresAt,
    });

    res.status(201).json({
      message: 'Invite sent successfully',
      email,
      expiresAt: inviteToken.expiresAt,
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

const triggerReportGeneration = async (req, res, next) => {
  try {
    await reportGenerator.run();
    res.json({ message: 'Weekly report generation completed' });
  } catch (error) {
    next(error);
  }
};

const setupTestReportData = async (req, res, next) => {
  try {
    await setupTestData();
    res.json({ message: 'Test report data setup completed' });
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
  triggerReportGeneration,
  setupTestReportData,
};
