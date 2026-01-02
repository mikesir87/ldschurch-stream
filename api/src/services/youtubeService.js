const { google } = require('googleapis');
const config = require('../config');
const logger = require('../utils/logger');
const { recordYouTubeRequest } = require('../utils/metrics');

class YouTubeService {
  constructor() {
    this.oauth2Client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if we're in development mode with placeholder credentials
      if (config.youtube.accessToken === 'placeholder-access-token') {
        logger.info('YouTube service initialized with mock server');

        // Configure Google APIs to use mock server
        this.oauth2Client = new google.auth.OAuth2('mock-client-id', 'mock-client-secret');

        // Set mock credentials
        this.oauth2Client.setCredentials({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        });

        this.initialized = true;
        return;
      }

      this.oauth2Client = new google.auth.OAuth2(
        config.youtube.clientId,
        config.youtube.clientSecret
      );

      if (config.youtube.accessToken && config.youtube.refreshToken) {
        this.oauth2Client.setCredentials({
          access_token: config.youtube.accessToken,
          refresh_token: config.youtube.refreshToken,
        });

        // Set up automatic token refresh
        this.oauth2Client.on('tokens', tokens => {
          if (tokens.refresh_token) {
            logger.info('YouTube refresh token updated');
          }
          if (tokens.access_token) {
            logger.info('YouTube access token refreshed');
          }
        });
      }

      this.initialized = true;
      logger.info('YouTube service initialized');
    } catch (error) {
      logger.error('Failed to initialize YouTube service', { error: error.message });
      throw error;
    }
  }

  async getAuthenticatedYouTube() {
    await this.initialize();

    // Development mode with mock server
    if (config.youtube.accessToken === 'placeholder-access-token') {
      logger.info('Using YouTube mock server at http://youtube-mock:3001');
      return google.youtube({
        version: 'v3',
        auth: this.oauth2Client,
        rootUrl: 'http://youtube-mock:3001',
      });
    }

    if (!config.youtube.accessToken) {
      throw new Error(
        'YouTube access token required. Run "npm run youtube:setup" to configure OAuth.'
      );
    }

    // Production mode - use default YouTube API endpoint
    return google.youtube({ version: 'v3', auth: this.oauth2Client });
  }

  async createLiveEvent(title, scheduledStartTime) {
    try {
      const youtube = await this.getAuthenticatedYouTube();

      // Create the broadcast
      const broadcast = await youtube.liveBroadcasts.insert({
        part: ['snippet', 'status', 'contentDetails'],
        requestBody: {
          snippet: {
            title,
            scheduledStartTime: scheduledStartTime.toISOString(),
          },
          status: {
            privacyStatus: 'unlisted',
            selfDeclaredMadeForKids: false,
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
          },
        },
      });

      // Create the stream
      const stream = await youtube.liveStreams.insert({
        part: ['snippet', 'cdn'],
        requestBody: {
          snippet: {
            title: `${title} - Stream`,
          },
          cdn: {
            resolution: '1080p',
            frameRate: '30fps',
            ingestionType: 'rtmp',
          },
        },
      });

      // Bind the stream to the broadcast
      await youtube.liveBroadcasts.bind({
        part: ['id'],
        id: broadcast.data.id,
        streamId: stream.data.id,
      });

      logger.info('YouTube Live event created', {
        broadcastId: broadcast.data.id,
        streamId: stream.data.id,
        title,
      });

      // Record successful API calls
      recordYouTubeRequest('liveBroadcasts.insert', true);
      recordYouTubeRequest('liveStreams.insert', true);
      recordYouTubeRequest('liveBroadcasts.bind', true);

      return {
        eventId: broadcast.data.id,
        streamId: stream.data.id,
        streamKey: stream.data.cdn.ingestionInfo.streamName,
        streamUrl: `https://www.youtube.com/watch?v=${broadcast.data.id}`,
      };
    } catch (error) {
      logger.error('Failed to create YouTube Live event', {
        error: error.message,
        title,
      });

      // Record failed API call with specific error type
      const errorType =
        error.code === 403 ? 'quota_exceeded' : error.code === 429 ? 'rate_limit' : 'api_error';
      recordYouTubeRequest('createLiveEvent', false, errorType);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const youtube = await this.getAuthenticatedYouTube();

      await youtube.liveBroadcasts.delete({
        id: eventId,
      });

      logger.info('YouTube Live event deleted', { eventId });
      recordYouTubeRequest('liveBroadcasts.delete', true);
    } catch (error) {
      logger.error('Failed to delete YouTube Live event', {
        error: error.message,
        eventId,
      });

      const errorType =
        error.code === 403 ? 'quota_exceeded' : error.code === 429 ? 'rate_limit' : 'api_error';
      recordYouTubeRequest('liveBroadcasts.delete', false, errorType);
      throw error;
    }
  }
}

module.exports = new YouTubeService();
