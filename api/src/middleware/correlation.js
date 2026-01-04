const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const correlationMiddleware = (req, res, next) => {
  // Skip logging for health endpoints
  if (req.url === '/health' || req.url === '/api/health') {
    return next();
  }

  // Use existing correlation ID or generate new one
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();

  // Add to response headers for client tracking
  res.setHeader('x-correlation-id', req.correlationId);

  // Create request-scoped logger
  req.logger = logger.child({
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Log incoming request
  req.logger.info('Request started');

  // Track response time
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = correlationMiddleware;
