const YouTubeTokens = require('../models/YouTubeTokens');
const config = require('../config');

module.exports = {
  async up() {
    // Only migrate if tokens exist in config and not already in database
    if (config.youtube.accessToken && config.youtube.refreshToken) {
      const existingTokens = await YouTubeTokens.findOne();

      if (!existingTokens) {
        await YouTubeTokens.create({
          accessToken: config.youtube.accessToken,
          refreshToken: config.youtube.refreshToken,
          expiryDate: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        });
        console.log('YouTube tokens migrated to database');
      }
    }
  },

  async down() {
    await YouTubeTokens.deleteMany({});
  },
};
