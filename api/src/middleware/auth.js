const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Access token required',
      },
    });
  }

  jwt.verify(token, config.auth.jwtSecret, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { token: token.substring(0, 20) });
      return res.status(403).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }

    req.user = user;
    next();
  });
};

const authorizeUnit = (req, res, next) => {
  const unitId = req.params.unitId;

  if (req.user.role === 'global_admin') {
    return next();
  }

  if (!req.user.units.includes(unitId)) {
    return res.status(403).json({
      error: {
        code: 'UNAUTHORIZED_UNIT',
        message: 'Access denied for this unit',
      },
    });
  }

  next();
};

const requireGlobalAdmin = (req, res, next) => {
  if (req.user.role !== 'global_admin') {
    return res.status(403).json({
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Global admin access required',
      },
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeUnit,
  requireGlobalAdmin,
};
