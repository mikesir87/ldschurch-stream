const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  const requestLogger = req.logger || logger;

  requestLogger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    statusCode: error.statusCode || 500,
    code: error.code,
    userId: req.user?.id,
    unitId: req.params?.unitId,
  });

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 400, 'DUPLICATE_FIELD');
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  res.status(error.statusCode || 500).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Something went wrong',
      correlationId: req.correlationId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { AppError, errorHandler };
