import './instrumentation.js';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { WebSocketPair } from './websocketPair.js';
import { connectedClients, connectionAttempts } from './metrics.js';
import { validateAccessCode } from './auth.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://dashboard.traefik.me'],
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'obs-proxy' });
});

// Access code validation endpoint for dashboard
app.get('/validate/:accessCode', async (req, res) => {
  const { accessCode } = req.params;
  const validation = await validateAccessCode(accessCode);

  logger.info('Access code validation request', {
    accessCode,
    valid: validation.valid,
    unitName: validation.unitName,
  });

  res.json(validation);
});

const server = app.listen(PORT, () => {
  logger.info(`OBS Proxy server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
const websocketPairs = {};

wss.on('connection', async (ws, request) => {
  const prefix = request.url.slice(1); // Remove leading "/"
  logger.info('New WebSocket connection', { prefix });

  const isController = prefix.includes('-controller');
  const accessCode = isController ? prefix.replace('-controller', '') : prefix;

  // Validate access code
  const validation = await validateAccessCode(accessCode);
  if (!validation.valid) {
    logger.warn('Invalid access code attempted', { accessCode });
    connectionAttempts.add(1, { type: isController ? 'controller' : 'obs', status: 'failed' });
    ws.close();
    return;
  }

  if (isController && !websocketPairs[accessCode]) {
    logger.warn('Controller connection attempted without OBS connection', { accessCode });
    connectionAttempts.add(1, { type: 'controller', status: 'failed' });
    ws.close();
    return;
  }

  if (isController) {
    connectionAttempts.add(1, { type: 'controller', status: 'success' });
    connectedClients.add(1, { type: 'controller' });
    websocketPairs[accessCode].setControllerSocket(ws);
    return;
  }

  connectionAttempts.add(1, { type: 'obs', status: 'success' });
  connectedClients.add(1, { type: 'obs' });

  if (!websocketPairs[accessCode]) {
    logger.info('Creating new WebSocketPair', { accessCode });
    websocketPairs[accessCode] = new WebSocketPair(accessCode, ws);
  }
  websocketPairs[accessCode].setObsSocket(ws);
});
