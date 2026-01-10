const { google } = require('googleapis');
const config = require('../config');
const logger = require('../utils/logger');
const { recordYouTubeRequest } = require('../utils/metrics');
const YouTubeTokens = require('../models/YouTubeTokens');

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

      // Load tokens from database first, fallback to config
      const dbTokens = await YouTubeTokens.findOne();
      const accessToken = dbTokens?.accessToken || config.youtube.accessToken;
      const refreshToken = dbTokens?.refreshToken || config.youtube.refreshToken;

      if (accessToken && refreshToken) {
        logger.info('Setting YouTube credentials', {
          source: dbTokens ? 'database' : 'config',
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenLength: accessToken?.length || 0,
          refreshTokenLength: refreshToken?.length || 0,
        });

        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
          expiry_date: dbTokens?.expiryDate?.getTime(),
        });

        // Set up automatic token refresh and database persistence
        this.oauth2Client.on('tokens', async tokens => {
          logger.info('YouTube token refresh completed', {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            accessTokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date).toISOString()
              : null,
          });

          // Save updated tokens to database
          try {
            await YouTubeTokens.findOneAndUpdate(
              {},
              {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || refreshToken,
                expiryDate: new Date(tokens.expiry_date),
              },
              { upsert: true }
            );
            logger.info('YouTube tokens saved to database');
          } catch (error) {
            logger.error('Failed to save YouTube tokens to database', {
              error: error.message,
            });
          }
        });
      } else {
        logger.warn('YouTube tokens not configured', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasClientId: !!config.youtube.clientId,
          hasClientSecret: !!config.youtube.clientSecret,
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
      logger.info('Creating YouTube Live event', {
        title,
        currentTokenExpiry: this.oauth2Client?.credentials?.expiry_date
          ? new Date(this.oauth2Client.credentials.expiry_date).toISOString()
          : 'unknown',
      });

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
