const fs = require('fs');

const readSecret = filePath => {
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Could not read secret from ${filePath}:`, error.message);
    return null;
  }
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/ldschurch-stream',
  },

  auth: {
    jwtSecret: readSecret(process.env.JWT_SECRET_FILE) || process.env.JWT_SECRET || 'dev-secret',
    jwtRefreshSecret:
      readSecret(process.env.JWT_REFRESH_SECRET_FILE) ||
      process.env.JWT_REFRESH_SECRET ||
      'dev-refresh-secret',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },

  youtube: {
    apiKey: readSecret(process.env.YOUTUBE_API_KEY_FILE) || process.env.YOUTUBE_API_KEY,
    clientId: readSecret(process.env.YOUTUBE_CLIENT_ID_FILE) || process.env.YOUTUBE_CLIENT_ID,
    clientSecret:
      readSecret(process.env.YOUTUBE_CLIENT_SECRET_FILE) || process.env.YOUTUBE_CLIENT_SECRET,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    accessToken:
      readSecret(process.env.YOUTUBE_ACCESS_TOKEN_FILE) || process.env.YOUTUBE_ACCESS_TOKEN,
    refreshToken:
      readSecret(process.env.YOUTUBE_REFRESH_TOKEN_FILE) || process.env.YOUTUBE_REFRESH_TOKEN,
  },

  email: {
    apiKey: readSecret(process.env.SENDGRID_API_KEY_FILE) || process.env.SENDGRID_API_KEY,
    mockHost: process.env.SENDGRID_MOCK_HOST,
    from: process.env.FROM_EMAIL || 'noreply@ldschurch.stream',
  },

  server: {
    port: parseInt(process.env.PORT) || 3000,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
  },

  cron: {
    youtubeBatchSchedule: process.env.YOUTUBE_BATCH_SCHEDULE || '0 */4 * * *',
    reportSchedule: process.env.REPORT_CRON_SCHEDULE || '0 6 * * 1', // Monday 6 AM
    timezone: process.env.TIMEZONE || 'America/New_York',
  },
};
