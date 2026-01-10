import './instrumentation.js';
import express from 'express';
import { WebSocketServer } from 'ws';
import { WebSocketPair } from './websocketPair.js';
import { connectedClients, connectionAttempts } from './metrics.js';
import { validateAccessCode } from './auth.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('./src/public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'obs-proxy' });
});

// Controller interface
app.get('/:accessCode', async (req, res) => {
  const { accessCode } = req.params;

  // Validate access code
  const validation = await validateAccessCode(accessCode);
  if (!validation.valid) {
    return res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invalid Access Code - LDSChurch.Stream</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #224466 0%, #4a90e2 100%);
            min-height: 100vh;
            font-family: 'Nunito Sans', sans-serif;
        }
        .brand-name {
            font-family: 'Nunito Sans', sans-serif;
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        .stream-suffix {
            font-weight: 500;
            font-size: 0.85em;
            opacity: 0.9;
        }
        .logo {
            height: 2.5rem;
            width: auto;
        }
        .error-card {
            border: none;
            border-radius: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div class="container mt-5 pt-4">
        <div class="text-center text-white mb-4">
            <div class="d-flex align-items-center justify-content-center gap-3 mb-3">
                <img src="/logos/logo-white.svg" alt="LDSChurch.Stream" class="logo" />
                <h1 class="brand-name mb-0">
                    LDSChurch<span class="stream-suffix">.Stream</span>
                </h1>
            </div>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card error-card">
                    <div class="card-body text-center">
                        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                        <h1 class="card-title text-danger mt-3">Invalid Access Code</h1>
                        <p class="card-text">The access code <code>${accessCode}</code> is invalid or has expired.</p>
                        <p class="card-text text-muted">Please generate a new access code from the dashboard.</p>
                        <a href="https://dashboard.ldschurch.stream" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `);
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OBS Remote Control - ${validation.unitName}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #224466 0%, #4a90e2 100%);
            min-height: 100vh;
            font-family: 'Nunito Sans', sans-serif;
        }
        .brand-name {
            font-family: 'Nunito Sans', sans-serif;
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        .stream-suffix {
            font-weight: 500;
            font-size: 0.85em;
            opacity: 0.9;
        }
        .logo {
            height: 2.5rem;
            width: auto;
        }
        .obs-card {
            border: none;
            border-radius: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div class="container mt-5 pt-4">
        <div class="text-center text-white mb-4">
            <div class="d-flex align-items-center justify-content-center gap-3 mb-3">
                <img src="/logos/logo-white.svg" alt="LDSChurch.Stream" class="logo" />
                <h1 class="brand-name mb-0">
                    LDSChurch<span class="stream-suffix">.Stream</span>
                </h1>
            </div>
            <p class="lead">OBS Remote Control</p>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card obs-card">
                    <div class="card-header bg-white">
                        <h2 class="card-title mb-1 text-primary">
                            <i class="bi bi-camera-video me-2"></i>Remote Control
                        </h2>
                        <small class="text-muted">${validation.unitName}</small>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-key me-2 text-muted"></i>
                                    <span class="text-muted me-2">Access Code:</span>
                                    <code id="access-code" class="bg-light px-2 py-1 rounded me-2">${accessCode}</code>
                                    <button class="btn btn-outline-primary btn-sm" onclick="copyAccessCode()">
                                        <i class="bi bi-clipboard me-1"></i>Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="card border-0 bg-light">
                                    <div class="card-body text-center">
                                        <i class="bi bi-wifi text-primary" style="font-size: 2rem;"></i>
                                        <h6 class="card-title mt-2">Proxy Connection</h6>
                                        <span id="proxy-connection-status" class="badge bg-danger">Disconnected</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-0 bg-light">
                                    <div class="card-body text-center">
                                        <i class="bi bi-camera-video text-primary" style="font-size: 2rem;"></i>
                                        <h6 class="card-title mt-2">OBS Connection</h6>
                                        <span id="obs-connection-status" class="badge bg-danger">Disconnected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-4" role="alert">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>Instructions:</strong> 
                            <ol class="mb-0 mt-2">
                                <li>This page will automatically connect to OBS when ready</li>
                                <li>Copy the access code above to use on your phone controller</li>
                                <li>Open the controller app on your phone and enter the access code</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="/script.js"></script>
</body>
</html>
  `);
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
