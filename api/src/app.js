// Initialize instrumentation first
require('./instrumentation');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config = require('./config');
const { connectDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const correlationMiddleware = require('./middleware/correlation');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow any subdomain of traefik.me or ldschurch.stream
      if (origin.match(/^https?:\/\/[a-z0-9-]+\.(traefik\.me|ldschurch\.stream)$/)) {
        return callback(null, true);
      }

      // Allow configured origins
      if (config.server.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.max,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  skip: req => req.url === '/health' || req.url === '/api/health',
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request correlation
app.use(correlationMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    // Seed development data if in development mode
    if (process.env.NODE_ENV === 'development') {
      const { seedDevelopmentData } = require('./utils/seed');
      await seedDevelopmentData();
    }

    // Start scheduled jobs
    const { JobScheduler } = require('./jobs');
    const jobScheduler = new JobScheduler();
    jobScheduler.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      jobScheduler.stop();
      process.exit(0);
    });

    const port = config.server.port;
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
