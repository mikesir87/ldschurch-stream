const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// In-memory storage for mock data
const broadcasts = new Map();
const streams = new Map();

// Mock YouTube Live Broadcasts API
app.post('/youtube/v3/liveBroadcasts', (req, res) => {
  console.log('=== BROADCAST REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw body type:', typeof req.body);
  console.log('========================');

  const requestBody = req.body || {};

  const broadcastId = `mock-broadcast-${uuidv4()}`;
  const broadcast = {
    id: broadcastId,
    snippet: {
      title: requestBody.snippet?.title || 'Mock Title',
      scheduledStartTime: requestBody.snippet?.scheduledStartTime || new Date().toISOString(),
    },
    status: {
      privacyStatus: requestBody.status?.privacyStatus || 'unlisted',
      lifeCycleStatus: 'created',
    },
    contentDetails: requestBody.contentDetails || {},
  };

  broadcasts.set(broadcastId, broadcast);

  res.json(broadcast);
});

app.delete('/youtube/v3/liveBroadcasts', (req, res) => {
  const { id } = req.query;
  broadcasts.delete(id);
  res.status(204).send();
});

// Mock YouTube Live Streams API
app.post('/youtube/v3/liveStreams', (req, res) => {
  console.log('=== STREAM REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('======================');

  const requestBody = req.body || {};

  const streamId = `mock-stream-${uuidv4()}`;
  const stream = {
    id: streamId,
    snippet: {
      title: requestBody.snippet?.title || 'Mock Stream',
    },
    cdn: {
      resolution: requestBody.cdn?.resolution || '1080p',
      ingestionType: requestBody.cdn?.ingestionType || 'rtmp',
      ingestionInfo: {
        streamName: `mock-key-${Date.now()}`,
      },
    },
  };

  streams.set(streamId, stream);

  res.json(stream);
});

// Mock Live Broadcasts Bind API
app.post('/youtube/v3/liveBroadcasts/bind', (req, res) => {
  console.log('=== BIND REQUEST ===');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('====================');

  // Try to get id and streamId from both query params and body
  const id = req.query.id || req.body.id;
  const streamId = req.query.streamId || req.body.streamId;

  if (!id) {
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Missing required parameters: id',
      },
    });
  }

  const broadcast = broadcasts.get(id);
  if (broadcast) {
    broadcast.contentDetails = broadcast.contentDetails || {};
    broadcast.contentDetails.boundStreamId = streamId;
    broadcasts.set(id, broadcast);
  }

  res.json(broadcast || { id, boundStreamId: streamId });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    broadcasts: broadcasts.size,
    streams: streams.size,
    version: '1.0.1', // Updated to test watch sync
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`YouTube Mock Server running on port ${PORT}`);
});

module.exports = app;
