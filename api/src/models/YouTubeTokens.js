const mongoose = require('mongoose');

const youtubeTokensSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one token document exists
youtubeTokensSchema.index({}, { unique: true });

module.exports = mongoose.model('YouTubeTokens', youtubeTokensSchema);
