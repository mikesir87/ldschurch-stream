const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InviteToken = require('../models/InviteToken');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { recordUserLogin } = require('../utils/metrics');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).populate('units');
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Record successful login
    recordUserLogin(user._id.toString(), true, user.role);

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        units: user.units.map(u => u._id.toString()),
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.accessTokenExpiry }
    );

    const refreshToken = jwt.sign({ id: user._id }, config.auth.jwtRefreshSecret, {
      expiresIn: config.auth.refreshTokenExpiry,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        units: user.units,
      },
    });
  } catch (error) {
    // Record failed login attempt
    if (error.code === 'INVALID_CREDENTIALS') {
      recordUserLogin(null, false);
    }
    next(error);
  }
};

const getInviteDetails = async (req, res, next) => {
  try {
    const { token } = req.params;

    const inviteToken = await InviteToken.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate('unitId', 'name');

    if (!inviteToken) {
      throw new AppError('Invalid or expired invite token', 400, 'INVALID_INVITE');
    }

    res.json({
      email: inviteToken.email,
      unitName: inviteToken.unitId.name,
      expiresAt: inviteToken.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const registerWithInvite = async (req, res, next) => {
  try {
    const { token, email, name, password } = req.body;

    const inviteToken = await InviteToken.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate('unitId');

    if (!inviteToken) {
      throw new AppError('Invalid or expired invite token', 400, 'INVALID_INVITE');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400, 'USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);

    const user = await User.create({
      email,
      name,
      hashedPassword,
      units: [inviteToken.unitId._id],
      role: 'specialist',
    });

    inviteToken.usedAt = new Date();
    inviteToken.usedBy = user._id;
    inviteToken.isActive = false;
    await inviteToken.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        units: [inviteToken.unitId],
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401, 'MISSING_REFRESH_TOKEN');
    }

    const decoded = jwt.verify(refreshToken, config.auth.jwtRefreshSecret);
    const user = await User.findById(decoded.id).populate('units');

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        units: user.units.map(u => u._id.toString()),
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.accessTokenExpiry }
    );

    const newRefreshToken = jwt.sign({ id: user._id }, config.auth.jwtRefreshSecret, {
      expiresIn: config.auth.refreshTokenExpiry,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  login,
  getInviteDetails,
  registerWithInvite,
  refresh,
  logout,
};
