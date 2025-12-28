const fs = require('fs');

const readSecret = (filePath) => {
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (error) {
    console.warn(`Could not read secret from ${filePath}:`, error.message);
    return null;
  }
};

module.exports = {
  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/ldschurch-stream'
  },
  
  auth: {
    jwtSecret: readSecret(process.env.JWT_SECRET_FILE) || process.env.JWT_SECRET || 'dev-secret',
    jwtRefreshSecret: readSecret(process.env.JWT_REFRESH_SECRET_FILE) || process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  
  youtube: {
    apiKey: readSecret(process.env.YOUTUBE_API_KEY_FILE) || process.env.YOUTUBE_API_KEY,
    clientId: readSecret(process.env.YOUTUBE_CLIENT_ID_FILE) || process.env.YOUTUBE_CLIENT_ID,
    clientSecret: readSecret(process.env.YOUTUBE_CLIENT_SECRET_FILE) || process.env.YOUTUBE_CLIENT_SECRET,
    channelId: process.env.YOUTUBE_CHANNEL_ID
  },
  
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: readSecret(process.env.SMTP_USER_FILE) || process.env.SMTP_USER,
    pass: readSecret(process.env.SMTP_PASS_FILE) || process.env.SMTP_PASS,
    from: process.env.FROM_EMAIL || 'noreply@ldschurch.stream'
  },
  
  server: {
    port: parseInt(process.env.PORT) || 3000,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
  }
};
