Technical Architecture (tech.md) - Defines the technical implementation approach, technology stack, data models, API design, and architectural decisions.

# LDSChurch.Stream Technical Architecture

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh token rotation
- **Email**: Nodemailer with SMTP provider
- **YouTube Integration**: Google APIs Node.js client
- **Scheduling**: node-cron for automated tasks

### Frontend

- **Framework**: React 18 with functional components and hooks
- **UI Library**: React Bootstrap 5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context + useReducer for complex state
- **Build Tool**: Vite for fast development and builds

### Deployment & Infrastructure

- **Container Platform**: Kubernetes cluster with dedicated namespace
- **Container Registry**: Docker Hub (`mikesir87` namespace)
- **SSL/TLS**: Ingress controller with CertManager for automatic certificate management
- **CI/CD**: GitHub Actions with Docker Build Cloud
- **Multi-Architecture**: linux/amd64 and linux/arm64 support
- **Database**: Containerized MongoDB (transitioning to managed service later)

### Container Image Strategy

```yaml
# Image naming convention
mikesir87/ldschurch-stream-api:20250101-120000
mikesir87/ldschurch-stream-dashboard:20250101-120000
mikesir87/ldschurch-stream-access:20250101-120000
mikesir87/ldschurch-stream-landing:20250101-120000

# Multi-architecture builds
- linux/amd64 (production)
- linux/arm64 (local development on Apple Silicon)
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: docker.io
  REGISTRY_USER: mikesir87

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api, dashboard, access, landing]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        with:
          driver: cloud
          endpoint: ${{ secrets.BUILDX_ENDPOINT }}
          token: ${{ secrets.BUILDX_TOKEN }}

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ env.REGISTRY_USER }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Generate timestamp tag
        id: timestamp
        run: echo "tag=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ${{ env.REGISTRY }}/${{ env.REGISTRY_USER }}/ldschurch-stream-${{ matrix.service }}:${{ steps.timestamp.outputs.tag }}
            ${{ env.REGISTRY }}/${{ env.REGISTRY_USER }}/ldschurch-stream-${{ matrix.service }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate timestamp tag
        id: timestamp
        run: echo "tag=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Update Kubernetes manifests
        run: |
          sed -i "s|mikesir87/ldschurch-stream-.*:.*|mikesir87/ldschurch-stream-api:${{ steps.timestamp.outputs.tag }}|g" k8s/api-deployment.yaml
          sed -i "s|mikesir87/ldschurch-stream-.*:.*|mikesir87/ldschurch-stream-dashboard:${{ steps.timestamp.outputs.tag }}|g" k8s/dashboard-deployment.yaml
          sed -i "s|mikesir87/ldschurch-stream-.*:.*|mikesir87/ldschurch-stream-access:${{ steps.timestamp.outputs.tag }}|g" k8s/access-deployment.yaml

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/namespace.yaml
            k8s/mongodb.yaml
            k8s/api-deployment.yaml
            k8s/dashboard-deployment.yaml
            k8s/access-deployment.yaml
            k8s/ingress.yaml
          kubeconfig: ${{ secrets.KUBECONFIG }}
```

### Kubernetes Deployment Structure

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ldschurch-stream

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ldschurch-stream-ingress
  namespace: ldschurch-stream
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  tls:
    - hosts:
        - ldschurch.stream
        - api.ldschurch.stream
        - dashboard.ldschurch.stream
        - '*.ldschurch.stream'
      secretName: ldschurch-stream-tls
  rules:
    - host: ldschurch.stream
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: landing-service
                port:
                  number: 80
    - host: api.ldschurch.stream
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 3000
    - host: dashboard.ldschurch.stream
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: dashboard-service
                port:
                  number: 80
    - host: '*.ldschurch.stream'
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: access-service
                port:
                  number: 80

---
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: ldschurch-stream
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: mikesir87/ldschurch-stream-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: MONGODB_URL
              value: 'mongodb://mongodb-service:27017/ldschurch-stream'
          volumeMounts:
            - name: secrets
              mountPath: /run/secrets
              readOnly: true
      volumes:
        - name: secrets
          secret:
            secretName: ldschurch-stream-secrets
```

### Secret Management

```yaml
# k8s/secrets.yaml (applied manually)
apiVersion: v1
kind: Secret
metadata:
  name: ldschurch-stream-secrets
  namespace: ldschurch-stream
type: Opaque
data:
  jwt_secret: <base64-encoded-secret>
  jwt_refresh_secret: <base64-encoded-secret>
  youtube_api_key: <base64-encoded-key>
  youtube_client_id: <base64-encoded-id>
  youtube_client_secret: <base64-encoded-secret>
  smtp_user: <base64-encoded-user>
  smtp_pass: <base64-encoded-pass>
```

### Production Configuration

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URL=mongodb://mongodb-service:27017/ldschurch-stream
JWT_SECRET_FILE=/run/secrets/jwt_secret
YOUTUBE_API_KEY_FILE=/run/secrets/youtube_api_key
CORS_ORIGINS=https://dashboard.ldschurch.stream,https://api.ldschurch.stream
SMTP_SECURE=true
BCRYPT_ROUNDS=12
```

### Frontend Configuration Deployment

Frontend applications use Kubernetes ConfigMaps to inject runtime configuration:

```yaml
# k8s/frontend-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboard-config
  namespace: ldschurch-stream
data:
  config.json: |
    {
      "apiUrl": "https://api.ldschurch.stream",
      "appName": "LDSChurch.Stream Dashboard"
    }
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: access-config
  namespace: ldschurch-stream
data:
  config.json: |
    {
      "apiUrl": "https://api.ldschurch.stream",
      "appName": "LDSChurch.Stream Access"
    }
```

Frontend deployments mount these ConfigMaps:

```yaml
# k8s/dashboard-deployment.yaml (excerpt)
spec:
  template:
    spec:
      containers:
        - name: dashboard
          image: mikesir87/ldschurch-stream-dashboard:latest
          volumeMounts:
            - name: config
              mountPath: /usr/share/nginx/html/config.json
              subPath: config.json
      volumes:
        - name: config
          configMap:
            name: dashboard-config
```

## Data Models

### Unit

```javascript
{
  _id: ObjectId,
  name: String, // "Blacksburg Ward"
  subdomain: String, // "blacksburg-va"
  createdAt: Date,
  updatedAt: Date,
  leadershipEmails: [String], // emails for automated reports
  isActive: Boolean
}
```

### User (Stream Specialists)

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  hashedPassword: String,
  units: [ObjectId], // references to Unit documents
  role: String, // "specialist" | "global_admin"
  createdAt: Date,
  lastLoginAt: Date,
  isActive: Boolean
}
```

### Stream Event

```javascript
{
  _id: ObjectId,
  unitId: ObjectId,
  scheduledDate: Date,
  scheduledTime: String, // "10:00 AM"
  youtubeEventId: String, // YouTube Live event ID
  youtubeStreamUrl: String,
  streamKey: String, // unique per unit
  status: String, // "scheduled" | "live" | "completed" | "cancelled"
  isSpecialEvent: Boolean, // true for non-streaming events
  specialEventMessage: String, // message for special events
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Record

```javascript
{
  _id: ObjectId,
  streamEventId: ObjectId,
  attendeeName: String,
  attendeeCount: Number,
  submittedAt: Date,
  ipAddress: String // for basic duplicate detection
}
```

### Invite Token

```javascript
{
  _id: ObjectId,
  token: String, // UUID
  unitId: ObjectId,
  createdBy: ObjectId, // global admin user
  expiresAt: Date,
  usedAt: Date,
  usedBy: ObjectId, // user who used the token
  isActive: Boolean
}
```

updatedAt: Date
}

````

### Attendance Record
```javascript
{
  _id: ObjectId,
  streamEventId: ObjectId,
  attendeeName: String,
  attendeeCount: Number,
  submittedAt: Date,
  ipAddress: String // for basic duplicate detection
}
````

### Invite Token

```javascript
{
  _id: ObjectId,
  token: String, // UUID
  unitId: ObjectId,
  createdBy: ObjectId, // global admin user
  expiresAt: Date,
  usedAt: Date,
  usedBy: ObjectId, // user who used the token
  isActive: Boolean
}
```

## API Design

### Authentication Endpoints

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Invalidate refresh token
- `POST /api/auth/register-with-invite` - Register using invite token

### Unit Management (Global Admin)

- `GET /api/admin/units` - List all units
- `POST /api/admin/units` - Create new unit
- `POST /api/admin/units/:id/invite` - Generate invite token
- `GET /api/admin/users` - List all users

### Stream Management (Specialists)

- `GET /api/units/:unitId/streams` - List streams for unit
- `POST /api/units/:unitId/streams` - Create new stream event
- `PUT /api/units/:unitId/streams/:streamId` - Update stream event
- `DELETE /api/units/:unitId/streams/:streamId` - Cancel stream event
- `GET /api/units/:unitId/stream-key` - Get current stream key

### Unit Configuration (Specialists)

- `GET /api/units/:unitId/settings` - Get unit settings
- `PUT /api/units/:unitId/settings` - Update leadership emails

### Attendance & Reporting (Specialists)

- `GET /api/units/:unitId/attendance` - Get attendance reports
- `GET /api/units/:unitId/attendance/search` - Search attendance by name
- `GET /api/units/:unitId/attendance/trends` - Get attendance trends

### Public Stream Access

- `GET /api/public/:subdomain/current-stream` - Get current/next stream info
- `POST /api/public/:subdomain/attend` - Submit attendance form

## Authentication & Authorization

### JWT Strategy

- **Access tokens**: 15-minute expiry, contain user ID and units
- **Refresh tokens**: 7-day expiry, stored in httpOnly cookies
- **Token rotation**: New refresh token issued on each refresh

### Authorization Levels

- **Public**: Stream access endpoints (no auth required)
- **Specialist**: Can manage assigned units only
- **Global Admin**: Can manage all units and create new ones

### Middleware

```javascript
// Verify JWT and attach user to request
const authenticateToken = (req, res, next) => { ... }

// Verify user can access specific unit
const authorizeUnit = (req, res, next) => { ... }

// Verify global admin role
const requireGlobalAdmin = (req, res, next) => { ... }
```

## YouTube Integration

### API Setup

- Use Google APIs Node.js client
- OAuth 2.0 service account for server-to-server auth
- Single YouTube channel managed by the application

### Stream Management

- Create YouTube Live events programmatically
- Generate unique stream keys per unit using unit ID + timestamp
- Set events as "Unlisted" for privacy
- Enable auto-start/auto-stop for streams
- Delete events and recordings 24 hours after completion

### Error Handling

- Retry logic for API rate limits
- Fallback messaging when YouTube API is unavailable
- Logging for all YouTube API interactions

## Email System

### SMTP Configuration

- Configurable SMTP provider (SendGrid, AWS SES, etc.)
- Template-based emails using handlebars or similar
- Queue system for bulk email sending

### Automated Reports

- Monday morning cron job (6 AM local time)
- Generate attendance reports with pattern analysis
- Send to configured leadership emails per unit
- Include unsubscribe links for compliance

## Scheduled Tasks

### Daily Cleanup (Monday 6 AM)

```javascript
// Find completed streams from previous day
// Generate and send attendance reports
// Delete YouTube events and recordings
// Archive old attendance data (optional)
```

### Weekly Maintenance

```javascript
// Clean up expired invite tokens
// Archive old stream events
// Generate system health reports
```

## Database Performance

### MongoDB Indexing Strategy

```javascript
// Essential indexes for performance
db.units.createIndex({ subdomain: 1 }, { unique: true }); // Fast unit lookups
db.users.createIndex({ email: 1 }, { unique: true }); // Authentication queries
db.users.createIndex({ units: 1 }); // User-unit relationship queries

// Stream event indexes
db.streamevents.createIndex({ unitId: 1, scheduledDate: -1 }); // Unit streams by date
db.streamevents.createIndex({ status: 1, scheduledDate: 1 }); // Active/scheduled streams
db.streamevents.createIndex({ youtubeEventId: 1 }); // YouTube integration lookups

// Attendance tracking indexes
db.attendancerecords.createIndex({ streamEventId: 1 }); // Attendance by stream
db.attendancerecords.createIndex({ streamEventId: 1, attendeeName: 1 }); // Name searches
db.attendancerecords.createIndex({ submittedAt: -1 }); // Recent submissions

// Administrative indexes
db.invitetokens.createIndex({ token: 1 }, { unique: true }); // Token validation
db.invitetokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-cleanup
```

### Connection Management

```javascript
// Mongoose connection configuration
const mongooseOptions = {
  maxPoolSize: 10, // Maximum number of connections
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};
```

## Error Handling & Logging

### Structured Logging

```javascript
// logger.js - Winston configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ldschurch-stream-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = logger;
```

### Standardized Error Responses

```javascript
// middleware/errorHandler.js
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    correlationId: req.correlationId,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 400, 'DUPLICATE_FIELD');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  res.status(error.statusCode || 500).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { AppError, errorHandler };
```

### Request Correlation

```javascript
// middleware/correlation.js
const { v4: uuidv4 } = require('uuid');

const correlationMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
};

module.exports = correlationMiddleware;
```

## Frontend Architecture

## Frontend Optimization

### Vite Build Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dashboard.traefik.me'], // or 'all' for wildcard subdomains
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: true,

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['react-bootstrap', 'bootstrap'],
          utils: ['axios', 'date-fns'],
        },
      },
    },

    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-bootstrap'],
  },
});
```

### Data Protection

- Hash passwords using bcrypt (12+ rounds)
- Sanitize all user inputs
- Rate limiting on authentication endpoints
- CORS configuration for frontend domains

### Privacy

- No PII verification (honesty-based attendance)
- IP address logging for basic duplicate detection only
- Attendance data retention policy (suggest 1 year max)
- Leadership email opt-out mechanism

### API Security

- Helmet.js for security headers
- Input validation using Joi or similar
- SQL injection prevention (though using MongoDB)
- XSS protection on all user-generated content

## Observability & Monitoring

### OpenTelemetry Integration

- **Framework**: OpenTelemetry Node.js SDK
- **Metrics**: Prometheus-compatible metrics export
- **Tracing**: Distributed tracing for API requests
- **Logging**: Structured logging with trace correlation

### Key Metrics

#### Business Metrics

```javascript
// Stream management metrics
stream_events_created_total; // Counter: successful stream creations
stream_events_failed_total; // Counter: failed stream creations
stream_events_cancelled_total; // Counter: cancelled streams
stream_events_active_gauge; // Gauge: currently active streams

// Attendance metrics
attendance_submissions_total; // Counter: attendance form submissions
attendance_submissions_failed_total; // Counter: failed submissions
attendance_unique_names_gauge; // Gauge: unique attendees per unit
attendance_total_count_gauge; // Gauge: total attendance count per unit

// User activity metrics
user_logins_total; // Counter: successful specialist logins
user_login_failures_total; // Counter: failed login attempts
invite_tokens_created_total; // Counter: invite tokens generated
invite_tokens_used_total; // Counter: invite tokens redeemed
```

#### Technical Metrics

```javascript
// API performance
http_requests_total; // Counter: HTTP requests by method, route, status
http_request_duration_seconds; // Histogram: request latency
http_requests_in_flight; // Gauge: concurrent requests

// Database metrics
mongodb_operations_total; // Counter: DB operations by type
mongodb_operation_duration_seconds; // Histogram: DB operation latency
mongodb_connections_active; // Gauge: active DB connections

// YouTube API metrics
youtube_api_requests_total; // Counter: YouTube API calls by endpoint
youtube_api_errors_total; // Counter: YouTube API errors by type
youtube_api_quota_remaining; // Gauge: remaining API quota

// Email system metrics
emails_sent_total; // Counter: emails sent successfully
emails_failed_total; // Counter: failed email deliveries
email_queue_size; // Gauge: pending emails in queue
```

### Instrumentation Setup

```javascript
// instrumentation.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ldschurch-stream-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
  }),
  metricReader: new PrometheusExporter({
    port: 9090,
    endpoint: '/metrics',
  }),
});

sdk.start();
```

### Custom Metrics Implementation

```javascript
// metrics/index.js
const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('ldschurch-stream', '1.0.0');

// Business metrics
const streamEventsCreated = meter.createCounter('stream_events_created_total', {
  description: 'Total number of stream events created',
});

const attendanceSubmissions = meter.createCounter('attendance_submissions_total', {
  description: 'Total attendance form submissions',
});

const activeStreams = meter.createUpDownCounter('stream_events_active_gauge', {
  description: 'Currently active stream events',
});

// Usage in application code
const recordStreamCreation = (unitId, success = true) => {
  if (success) {
    streamEventsCreated.add(1, { unit_id: unitId, status: 'success' });
    activeStreams.add(1, { unit_id: unitId });
  } else {
    streamEventsCreated.add(1, { unit_id: unitId, status: 'failed' });
  }
};

const recordAttendanceSubmission = (unitId, attendeeCount) => {
  attendanceSubmissions.add(1, { unit_id: unitId });
  // Additional metrics for attendance patterns
};
```

### Alerting Rules

```yaml
# alerts.yml
groups:
  - name: ldschurch-stream
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        annotations:
          summary: 'High error rate detected'

      - alert: StreamCreationFailures
        expr: rate(stream_events_failed_total[10m]) > 0
        for: 1m
        annotations:
          summary: 'Stream creation failures detected'

      - alert: YouTubeAPIQuotaLow
        expr: youtube_api_quota_remaining < 1000
        annotations:
          summary: 'YouTube API quota running low'

      - alert: DatabaseConnectionIssues
        expr: mongodb_connections_active == 0
        for: 30s
        annotations:
          summary: 'No active database connections'
```

### Dashboard Configuration

```json
{
  "dashboard": {
    "title": "LDSChurch.Stream Monitoring",
    "panels": [
      {
        "title": "Stream Events",
        "metrics": ["rate(stream_events_created_total[5m])", "stream_events_active_gauge"]
      },
      {
        "title": "Attendance Submissions",
        "metrics": ["rate(attendance_submissions_total[5m])", "attendance_unique_names_gauge"]
      },
      {
        "title": "API Performance",
        "metrics": [
          "rate(http_requests_total[5m])",
          "histogram_quantile(0.95, http_request_duration_seconds)"
        ]
      },
      {
        "title": "YouTube API Usage",
        "metrics": ["rate(youtube_api_requests_total[5m])", "youtube_api_quota_remaining"]
      }
    ]
  }
}
```

## Configuration Management

### Environment Variables

```bash
# Database
MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream

# Authentication & Security
JWT_SECRET_FILE=/run/secrets/jwt_secret
JWT_REFRESH_SECRET_FILE=/run/secrets/jwt_refresh_secret
BCRYPT_ROUNDS=12

# YouTube Integration
YOUTUBE_API_KEY_FILE=/run/secrets/youtube_api_key
YOUTUBE_CLIENT_ID_FILE=/run/secrets/youtube_client_id
YOUTUBE_CLIENT_SECRET_FILE=/run/secrets/youtube_client_secret
YOUTUBE_CHANNEL_ID=your-channel-id

# Email Configuration
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER_FILE=/run/secrets/smtp_user
SMTP_PASS_FILE=/run/secrets/smtp_pass
FROM_EMAIL=noreply@ldschurch.stream

# Application Settings
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://dashboard.traefik.me,http://api.traefik.me
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cron Settings
REPORT_CRON_SCHEDULE=0 6 * * 1  # Monday 6 AM
CLEANUP_CRON_SCHEDULE=0 7 * * 1  # Monday 7 AM
TIMEZONE=America/New_York

# Data Retention
ATTENDANCE_RETENTION_DAYS=365
INVITE_TOKEN_EXPIRY_HOURS=72
```

### Docker Secrets Configuration

```yaml
# compose.yaml
services:
  api:
    build: ./api
    environment:
      - NODE_ENV=development
      - MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - JWT_REFRESH_SECRET_FILE=/run/secrets/jwt_refresh_secret
      - YOUTUBE_API_KEY_FILE=/run/secrets/youtube_api_key
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
      - FROM_EMAIL=noreply@ldschurch.stream
    secrets:
      - jwt_secret
      - jwt_refresh_secret
      - youtube_api_key
      - youtube_client_id
      - youtube_client_secret
    volumes:
      - ./config/development.env:/app/.env:ro
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.api.rule=Host(`api.traefik.me`)'
      - 'traefik.http.services.api.loadbalancer.server.port=3000'

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  jwt_refresh_secret:
    file: ./secrets/jwt_refresh_secret.txt
  youtube_api_key:
    file: ./secrets/youtube_api_key.txt
  youtube_client_id:
    file: ./secrets/youtube_client_id.txt
  youtube_client_secret:
    file: ./secrets/youtube_client_secret.txt
  smtp_user:
    file: ./secrets/smtp_user.txt
  smtp_pass:
    file: ./secrets/smtp_pass.txt
```

### Configuration Loading Pattern

```javascript
// config/index.js
const fs = require('fs');

const readSecret = filePath => {
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
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/ldschurch-stream',
  },

  auth: {
    jwtSecret: readSecret(process.env.JWT_SECRET_FILE) || process.env.JWT_SECRET,
    jwtRefreshSecret:
      readSecret(process.env.JWT_REFRESH_SECRET_FILE) || process.env.JWT_REFRESH_SECRET,
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
  },

  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: readSecret(process.env.SMTP_USER_FILE) || process.env.SMTP_USER,
    pass: readSecret(process.env.SMTP_PASS_FILE) || process.env.SMTP_PASS,
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
    reportSchedule: process.env.REPORT_CRON_SCHEDULE || '0 6 * * 1',
    cleanupSchedule: process.env.CLEANUP_CRON_SCHEDULE || '0 7 * * 1',
    timezone: process.env.TIMEZONE || 'America/New_York',
  },

  retention: {
    attendanceDays: parseInt(process.env.ATTENDANCE_RETENTION_DAYS) || 365,
    inviteTokenHours: parseInt(process.env.INVITE_TOKEN_EXPIRY_HOURS) || 72,
  },
};
```

### Environment-Specific Configuration

```bash
# config/development.env
NODE_ENV=development
CORS_ORIGINS=http://dashboard.traefik.me,http://api.traefik.me
RATE_LIMIT_MAX_REQUESTS=1000
BCRYPT_ROUNDS=4  # Faster for development

# config/production.env
NODE_ENV=production
CORS_ORIGINS=https://dashboard.ldschurch.stream,https://api.ldschurch.stream
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
SMTP_SECURE=true
```

### Secret File Structure

```
secrets/
├── jwt_secret.txt
├── jwt_refresh_secret.txt
├── youtube_api_key.txt
├── youtube_client_id.txt
├── youtube_client_secret.txt
├── smtp_user.txt
└── smtp_pass.txt
```

### Local Setup

- **Docker Compose** services:
  - MongoDB for data storage
  - Mongo Express for database visualization (http://localhost:8081)
  - Keycloak for OAuth/OIDC authentication testing (http://localhost:8080)
  - MailHog for email testing and visualization (http://localhost:8025)
- Environment variables for all configuration
- Separate .env files for different environments
- Hot reload for both API and frontend development

### Docker Services Configuration

```yaml
# compose.yaml
services:
  traefik:
    image: traefik:3.6.5
    command:
      - '--api.insecure=true'
      - '--providers.docker=true'
      - '--providers.docker.exposedbydefault=false'
      - '--entrypoints.web.address=:80'
    ports:
      - '80:80'
      - '8080:8080' # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.traefik.rule=Host(`traefik.traefik.me`)'
      - 'traefik.http.services.traefik.loadbalancer.server.port=8080'

  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    labels:
      - 'traefik.enable=false'

  mongo-express:
    image: mongo-express
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongodb:27017/
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mongo-express.rule=Host(`db.traefik.me`)'
      - 'traefik.http.services.mongo-express.loadbalancer.server.port=8081'

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.keycloak.rule=Host(`auth.traefik.me`)'
      - 'traefik.http.services.keycloak.loadbalancer.server.port=8080'

  mailhog:
    image: mailhog/mailhog
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mailhog.rule=Host(`mail.traefik.me`)'
      - 'traefik.http.services.mailhog.loadbalancer.server.port=8025'

  # Application services (when running locally)
  api:
    build: ./api
    environment:
      - NODE_ENV=development
      - MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.api.rule=Host(`api.traefik.me`)'
      - 'traefik.http.services.api.loadbalancer.server.port=3000'
    depends_on:
      - mongodb
      - mailhog

  dashboard:
    build: ./dashboard
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.dashboard.rule=Host(`dashboard.traefik.me`)'
      - 'traefik.http.services.dashboard.loadbalancer.server.port=5173'
    depends_on:
      - api

  # Landing/marketing page
  landing:
    build: ./landing
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.landing.rule=Host(`ldschurch.traefik.me`)'
      - 'traefik.http.services.landing.loadbalancer.server.port=5173'

  # Stream access app (simulates subdomain routing)
  access:
    build: ./access
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.access.rule=Host(`blacksburg-va.traefik.me`) || Host(`provo-ut.traefik.me`) || HostRegexp(`{subdomain:[a-z0-9-]+}.traefik.me`)'
      - 'traefik.http.services.access.loadbalancer.server.port=5173'
    depends_on:
      - api
```

### Local Development URLs

- **Traefik Dashboard**: http://traefik.traefik.me
- **API**: http://api.traefik.me
- **Landing Page**: http://ldschurch.traefik.me
- **Stream Dashboard**: http://dashboard.traefik.me
- **Database Admin**: http://db.traefik.me
- **Auth Provider**: http://auth.traefik.me
- **Email Testing**: http://mail.traefik.me
- **Stream Access Examples**:
  - http://blacksburg-va.traefik.me
  - http://provo-ut.traefik.me
  - http://any-unit.traefik.me

### Testing Strategy

- Unit tests for business logic (Jest)
- Integration tests for API endpoints (Supertest)
- Frontend component tests (React Testing Library)
- End-to-end tests for critical workflows (Playwright)
