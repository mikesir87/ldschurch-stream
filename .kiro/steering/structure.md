# LDSChurch.Stream Project Structure

## Repository Organization

```
ldschurch-stream/
├── api/                          # Backend API service
├── dashboard/                    # Stream specialist dashboard (React)
├── access/                       # Stream attendee access app (React)
├── landing/                      # Marketing/landing page (React)
├── youtube-mock/                 # YouTube API mock server for development
├── k8s/                         # Kubernetes deployment manifests
├── monitoring/                   # Observability configuration
├── secrets/                      # Local development secrets
├── .github/workflows/           # CI/CD pipelines
├── compose.yaml                 # Local development environment
└── README.md                    # Project documentation
```

## API Service Structure

```
api/
├── src/
│   ├── config/                  # Configuration management
│   │   ├── index.js            # Main config loader
│   │   └── database.js         # MongoDB connection setup
│   ├── controllers/            # Route handlers
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── admin.js           # Global admin operations
│   │   ├── units.js           # Unit management
│   │   ├── streams.js         # Stream event management
│   │   └── public.js          # Public stream access
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── validation.js      # Request validation
│   │   ├── errorHandler.js    # Error handling
│   │   └── correlation.js     # Request correlation
│   ├── models/                 # Mongoose schemas
│   │   ├── Unit.js            # Unit model
│   │   ├── User.js            # User model
│   │   ├── StreamEvent.js     # Stream event model
│   │   ├── AttendanceRecord.js # Attendance model
│   │   └── InviteToken.js     # Invite token model
│   ├── services/               # Business logic
│   │   ├── authService.js     # Authentication logic
│   │   ├── youtubeService.js  # YouTube API integration
│   │   ├── emailService.js    # Email sending
│   │   └── reportService.js   # Report generation
│   ├── utils/                  # Utility functions
│   │   ├── logger.js          # Winston logging setup
│   │   ├── validation.js      # Joi validation schemas
│   │   └── crypto.js          # Encryption utilities
│   ├── routes/                 # Route definitions
│   │   ├── index.js           # Route aggregation
│   │   ├── auth.js            # Auth routes
│   │   ├── admin.js           # Admin routes
│   │   ├── units.js           # Unit routes
│   │   └── public.js          # Public routes
│   ├── jobs/                   # Scheduled tasks
│   │   ├── index.js           # Job scheduler setup
│   │   ├── reportGenerator.js # Weekly report generation and cleanup
│   │   └── youtubeBatchProcessor.js # YouTube event creation batch processing
│   └── app.js                  # Express app setup
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test data
├── Dockerfile                  # Container build
├── package.json               # Dependencies
└── .env.example               # Environment template
```

## Frontend Applications Structure

Both `dashboard/` and `access/` follow the same React structure:

```
dashboard/ (or access/)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components
│   │   │   ├── Layout.jsx     # Page layout wrapper
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── forms/             # Form components
│   │   │   ├── StreamEventForm.jsx
│   │   │   └── AttendanceForm.jsx
│   │   └── charts/            # Data visualization
│   │       └── AttendanceTrends.jsx
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── StreamManagement.jsx
│   │   ├── AttendanceReports.jsx
│   │   └── Settings.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js         # Authentication hook
│   │   ├── useApi.js          # API interaction hook
│   │   ├── useConfig.js       # Runtime configuration hook
│   │   └── useLocalStorage.js # Local storage hook
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios configuration
│   │   ├── authService.js     # Authentication API calls
│   │   └── streamService.js   # Stream management API calls
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── ConfigContext.jsx  # Runtime configuration state
│   │   └── UnitContext.jsx    # Unit selection state
│   ├── utils/                 # Utility functions
│   │   ├── dateHelpers.js     # Date formatting
│   │   ├── validation.js      # Form validation
│   │   └── constants.js       # App constants
│   ├── styles/                # CSS/SCSS files
│   │   ├── globals.css        # Global styles
│   │   └── components.css     # Component styles
│   ├── App.jsx                # Root component
│   └── main.jsx               # React entry point
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── config.json           # Runtime configuration
│   └── favicon.ico           # App icon
├── Dockerfile                 # Container build
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

### Landing Page Structure

The `landing/` application follows a simplified React structure focused on marketing content:

```
landing/
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components
│   │   │   ├── Header.jsx     # Site header with navigation
│   │   │   ├── Footer.jsx     # Site footer
│   │   │   └── Layout.jsx     # Page layout wrapper
│   │   ├── sections/          # Page sections
│   │   │   ├── Hero.jsx       # Hero section with CTA
│   │   │   ├── About.jsx      # About section
│   │   │   ├── Features.jsx   # Key features showcase
│   │   │   └── FAQ.jsx        # Frequently asked questions
│   │   └── ui/                # UI components
│   │       ├── Button.jsx     # Styled buttons
│   │       └── Card.jsx       # Content cards
│   ├── pages/                 # Page components
│   │   ├── Home.jsx           # Main landing page
│   │   ├── About.jsx          # Detailed about page
│   │   └── Contact.jsx        # Contact information
│   ├── styles/                # CSS/SCSS files
│   │   ├── globals.css        # Global styles
│   │   ├── components.css     # Component styles
│   │   └── landing.css        # Landing-specific styles
│   ├── assets/                # Static assets
│   │   ├── images/           # Images and graphics
│   │   └── icons/            # Icon files
│   ├── utils/                 # Utility functions
│   │   └── constants.js       # App constants
│   ├── App.jsx                # Root component
│   └── main.jsx               # React entry point
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── favicon.ico           # App icon
│   └── robots.txt            # SEO robots file
├── Dockerfile                 # Container build
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
└── .env.example              # Environment template
```

### YouTube Mock Server Structure

The `youtube-mock/` service provides a development-only mock of the YouTube Data API v3:

```
youtube-mock/
├── server.js                  # Express server with YouTube API endpoints
├── package.json              # Dependencies (express, uuid)
├── Dockerfile                 # Container build for development
└── .eslintrc.json            # ESLint configuration
```

#### Mock Server Endpoints

```javascript
// YouTube Live Broadcasts API
POST /youtube/v3/liveBroadcasts    # Create live broadcast
DELETE /youtube/v3/liveBroadcasts  # Delete live broadcast

// YouTube Live Streams API
POST /youtube/v3/liveStreams       # Create live stream

// YouTube Live Broadcasts Bind API
POST /youtube/v3/liveBroadcasts/bind # Bind broadcast to stream

// Health check
GET /health                        # Server status and metrics
```

#### Development Integration

- Automatically used when `YOUTUBE_ACCESS_TOKEN=placeholder-access-token`
- Provides realistic API responses without quota consumption
- Generates unique mock IDs and stream keys for testing
- Available at http://youtube-mock.traefik.me for debugging
- Supports complete YouTube Live streaming workflow simulation

```
dashboard/ (or access/)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components
│   │   │   ├── Layout.jsx     # Page layout wrapper
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── forms/             # Form components
│   │   │   ├── StreamEventForm.jsx
│   │   │   └── AttendanceForm.jsx
│   │   └── charts/            # Data visualization
│   │       └── AttendanceTrends.jsx
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── StreamManagement.jsx
│   │   ├── AttendanceReports.jsx
│   │   └── Settings.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js         # Authentication hook
│   │   ├── useApi.js          # API interaction hook
│   │   ├── useConfig.js       # Runtime configuration hook
│   │   └── useLocalStorage.js # Local storage hook
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios configuration
│   │   ├── authService.js     # Authentication API calls
│   │   └── streamService.js   # Stream management API calls
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── ConfigContext.jsx  # Runtime configuration state
│   │   └── UnitContext.jsx    # Unit selection state
│   ├── utils/                 # Utility functions
│   │   ├── dateHelpers.js     # Date formatting
│   │   ├── validation.js      # Form validation
│   │   └── constants.js       # App constants
│   ├── styles/                # CSS/SCSS files
│   │   ├── globals.css        # Global styles
│   │   └── components.css     # Component styles
│   ├── App.jsx                # Root component
│   └── main.jsx               # React entry point
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── config.json           # Runtime configuration
│   └── favicon.ico           # App icon
├── Dockerfile                 # Container build
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Naming Conventions

### Files and Directories

- **Directories**: lowercase with hyphens (`stream-management/`)
- **React Components**: PascalCase (`StreamEventForm.jsx`)
- **JavaScript files**: camelCase (`authService.js`)
- **CSS files**: lowercase with hyphens (`stream-management.css`)
- **Test files**: `*.test.js` or `*.spec.js`

### Code Conventions

- **Variables**: camelCase (`streamEvent`, `attendeeCount`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `JWT_EXPIRY`)
- **Functions**: camelCase (`createStreamEvent`, `validateInput`)
- **Classes**: PascalCase (`StreamEvent`, `AttendanceRecord`)
- **Database fields**: camelCase (`createdAt`, `isActive`)

### API Conventions

- **Endpoints**: kebab-case (`/api/units/:unitId/streams`, `/api/units/:unitId/attendance`)
- **Query parameters**: camelCase (`?startDate=2024-01-01&unitId=123`)
- **JSON fields**: camelCase (`{ "streamUrl": "...", "attendeeCount": 5 }`)

## Import Patterns

### Backend (Node.js)

```javascript
// External dependencies first
const express = require('express');
const mongoose = require('mongoose');

// Internal modules by category
const config = require('../config');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const StreamEvent = require('../models/StreamEvent');
const youtubeService = require('../services/youtubeService');
```

### Frontend (React)

```javascript
// React and external libraries first
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

// Internal imports by category
import Layout from '../components/common/Layout';
import StreamEventForm from '../components/forms/StreamEventForm';
import { useAuth } from '../hooks/useAuth';
import { streamService } from '../services/streamService';
import { formatDate } from '../utils/dateHelpers';
```

## Environment Configuration

### API Environment Variables

```bash
# API (.env.development)
NODE_ENV=development
PORT=3000
MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream
CORS_ORIGINS=http://dashboard.traefik.me,http://api.traefik.me

# API (.env.production)
NODE_ENV=production
PORT=3000
MONGODB_URL=mongodb://mongodb-service:27017/ldschurch-stream
CORS_ORIGINS=https://dashboard.ldschurch.stream,https://api.ldschurch.stream
```

### Frontend Runtime Configuration

Frontend applications load configuration at runtime from `/config.json`:

```json
// dashboard/public/config.json (development)
{
  "apiUrl": "http://api.traefik.me",
  "appName": "LDSChurch.Stream Dashboard"
}

// dashboard/public/config.json (production)
{
  "apiUrl": "https://api.ldschurch.stream",
  "appName": "LDSChurch.Stream Dashboard"
}

// access/public/config.json (development)
{
  "apiUrl": "http://api.traefik.me",
  "appName": "LDSChurch.Stream Access"
}

// access/public/config.json (production)
{
  "apiUrl": "https://api.ldschurch.stream",
  "appName": "LDSChurch.Stream Access"
}
```

## Docker Configuration

### Multi-stage Dockerfile Pattern

```dockerfile
# Frontend Dockerfile template
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile Pattern

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

## Testing Structure

### Backend Testing

```
api/tests/
├── unit/                      # Unit tests
│   ├── services/             # Service layer tests
│   ├── models/               # Model validation tests
│   └── utils/                # Utility function tests
├── integration/              # Integration tests
│   ├── auth.test.js         # Authentication flow tests
│   ├── streams.test.js      # Stream management tests
│   └── attendance.test.js   # Attendance tracking tests
├── fixtures/                 # Test data
│   ├── users.json           # Sample user data
│   └── streams.json         # Sample stream data
└── setup.js                 # Test environment setup
```

### Frontend Testing

```
dashboard/src/tests/
├── components/               # Component tests
│   ├── StreamEventForm.test.jsx
│   └── AttendanceTrends.test.jsx
├── hooks/                    # Hook tests
│   └── useAuth.test.js
├── services/                 # Service tests
│   └── authService.test.js
└── utils/                    # Utility tests
    └── dateHelpers.test.js
```

## Database Schema Patterns

### Model Definition Pattern

```javascript
// models/StreamEvent.js
const mongoose = require('mongoose');

const streamEventSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
streamEventSchema.index({ unitId: 1, scheduledDate: -1 });
streamEventSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('StreamEvent', streamEventSchema);
```

## Error Handling Patterns

### API Error Response Format

```javascript
// Standardized error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "correlationId": "uuid-here"
  }
}
```

### Frontend Error Handling

```javascript
// services/api.js
const handleApiError = error => {
  if (error.response?.data?.error) {
    return {
      code: error.response.data.error.code,
      message: error.response.data.error.message,
      status: error.response.status,
    };
  }
  return {
    code: 'NETWORK_ERROR',
    message: 'Unable to connect to server',
    status: 0,
  };
};
```

## State Management Patterns

### React Context Pattern

```javascript
// context/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async credentials => {
    // Authentication logic
  };

  const logout = () => {
    // Logout logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Runtime Configuration Pattern

```javascript
// context/ConfigContext.jsx
const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/config.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load config');
        return res.json();
      })
      .then(setConfig)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
```

## Subdomain Routing Logic

### Unit Subdomain Resolution

The access app extracts the unit subdomain from the hostname and maps it to database records:

```javascript
// utils/subdomainHelper.js
export const extractSubdomain = () => {
  const hostname = window.location.hostname;

  // Extract subdomain from hostname
  // blacksburg-va.ldschurch.stream → blacksburg-va
  // localhost/traefik.me → handle dev cases
  if (hostname.includes('.ldschurch.stream')) {
    return hostname.split('.ldschurch.stream')[0];
  }

  // Development: blacksburg-va.traefik.me → blacksburg-va
  if (hostname.includes('.traefik.me')) {
    return hostname.split('.traefik.me')[0];
  }

  return null;
};

// hooks/useUnit.js
export const useUnit = () => {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const subdomain = extractSubdomain();

    if (!subdomain) {
      setError('Invalid subdomain');
      setLoading(false);
      return;
    }

    // API call to resolve unit
    fetch(`/api/public/${subdomain}/unit-info`)
      .then(res => {
        if (!res.ok) throw new Error('Unit not found');
        return res.json();
      })
      .then(setUnit)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { unit, loading, error };
};
```

### API Endpoint Pattern

```javascript
// Subdomain-based routing (Option A)
GET /api/public/:subdomain/current-stream
GET /api/public/:subdomain/unit-info
POST /api/public/:subdomain/attend

// Example URLs:
// /api/public/blacksburg-va/current-stream
// /api/public/provo-ut/attend
```

### Error Handling for Invalid Units

```javascript
// pages/StreamAccess.jsx
const StreamAccess = () => {
  const { unit, loading, error } = useUnit();

  if (loading) return <LoadingSpinner />;

  if (error || !unit) {
    return <UnitNotFoundPage subdomain={extractSubdomain()} />;
  }

  return <AttendanceForm unit={unit} />;
};

// components/UnitNotFoundPage.jsx
const UnitNotFoundPage = ({ subdomain }) => (
  <div className="text-center py-5">
    <h1>🏰 Unit Not Found</h1>
    <p>Sorry, we couldn't find a unit with the name "{subdomain}".</p>
    <p>Double-check the URL or contact your local leadership.</p>
    <small className="text-muted">Looking for help? Email support@ldschurch.stream</small>
  </div>
);
```

### Subdomain Validation Rules

```javascript
// utils/validation.js
export const isValidSubdomain = subdomain => {
  // Format: lowercase letters, numbers, hyphens
  // Examples: blacksburg-va, provo-ut, ward-123
  const pattern = /^[a-z0-9-]+$/;
  return pattern.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 50;
};
```

### Database Unit Model

```javascript
// models/Unit.js - subdomain field
const unitSchema = new mongoose.Schema({
  name: String, // "Blacksburg Ward"
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/,
    minlength: 3,
    maxlength: 50,
    index: true, // Fast subdomain lookups
  },
  // ... other fields
});
```

## Database Migration Patterns

### Migration Structure

```
api/src/migrations/
├── index.js                    # Migration runner
├── 001-create-initial-indexes.js
├── 002-add-subdomain-field.js
├── 003-update-stream-status-enum.js
└── completed.json              # Track completed migrations
```

### Migration Runner

```javascript
// migrations/index.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

class MigrationRunner {
  constructor() {
    this.completedFile = path.join(__dirname, 'completed.json');
    this.completed = this.loadCompleted();
  }

  loadCompleted() {
    try {
      return JSON.parse(fs.readFileSync(this.completedFile, 'utf8'));
    } catch {
      return [];
    }
  }

  saveCompleted() {
    fs.writeFileSync(this.completedFile, JSON.stringify(this.completed, null, 2));
  }

  async runPending() {
    const files = fs
      .readdirSync(__dirname)
      .filter(f => f.match(/^\d{3}-.*\.js$/))
      .sort();

    for (const file of files) {
      if (!this.completed.includes(file)) {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(__dirname, file));
        await migration.up();
        this.completed.push(file);
        this.saveCompleted();
        console.log(`Completed migration: ${file}`);
      }
    }
  }
}

module.exports = { MigrationRunner };
```

### Migration Template

```javascript
// migrations/002-add-subdomain-field.js
module.exports = {
  async up() {
    const db = mongoose.connection.db;

    // Add subdomain field to existing units
    await db
      .collection('units')
      .updateMany({ subdomain: { $exists: false } }, { $set: { subdomain: null } });

    // Create unique index on subdomain
    await db.collection('units').createIndex({ subdomain: 1 }, { unique: true, sparse: true });
  },

  async down() {
    const db = mongoose.connection.db;

    // Remove subdomain field
    await db.collection('units').updateMany({}, { $unset: { subdomain: '' } });

    // Drop index
    await db.collection('units').dropIndex({ subdomain: 1 });
  },
};
```

### Application Startup Integration

```javascript
// src/app.js
const { MigrationRunner } = require('./migrations');

async function startApp() {
  // Connect to database
  await mongoose.connect(config.database.url);

  // Run pending migrations
  const migrationRunner = new MigrationRunner();
  await migrationRunner.runPending();

  // Start Express server
  app.listen(config.server.port);
}
```

### Migration Commands

```json
// package.json
{
  "scripts": {
    "migrate": "node -e \"require('./src/migrations').MigrationRunner().runPending()\"",
    "migrate:create": "node scripts/create-migration.js"
  }
}
```

### Migration Creation Script

```javascript
// scripts/create-migration.js
const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('Usage: npm run migrate:create <migration-name>');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../src/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.match(/^\d{3}-/));
const nextNumber = String(files.length + 1).padStart(3, '0');
const filename = `${nextNumber}-${name.replace(/\s+/g, '-')}.js`;

const template = `module.exports = {
  async up() {
    const db = mongoose.connection.db;
    
    // Migration logic here
  },

  async down() {
    const db = mongoose.connection.db;
    
    // Rollback logic here
  }
};
`;

fs.writeFileSync(path.join(migrationsDir, filename), template);
console.log(`Created migration: ${filename}`);
```

## Scheduled Tasks Structure

### Cron Job Organization

```
api/src/jobs/
├── index.js                   # Job scheduler setup
├── reportGenerator.js        # Monday morning attendance reports and cleanup
└── youtubeBatchProcessor.js  # YouTube event creation (every 4 hours)
```

### Job Scheduler Setup

```javascript
// jobs/index.js
const cron = require('node-cron');
const logger = require('../utils/logger');
const config = require('../config');
const youtubeBatchProcessor = require('./youtubeBatchProcessor');
const reportGenerator = require('./reportGenerator');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // YouTube batch processing - configurable schedule
    this.schedule('youtube-batch', config.cron.youtubeBatchSchedule, () =>
      youtubeBatchProcessor.processPendingStreams()
    );

    // Weekly reports - Monday morning
    this.schedule('weekly-reports', config.cron.reportSchedule, () => reportGenerator.run());

    logger.info('Job scheduler started');
  }

  schedule(name, cronExpression, task) {
    const job = cron.schedule(
      cronExpression,
      async () => {
        logger.info(`Starting job: ${name}`);
        try {
          await task();
          logger.info(`Completed job: ${name}`);
        } catch (error) {
          logger.error(`Job failed: ${name}`, { error: error.message });
        }
      },
      { scheduled: false }
    );

    this.jobs.set(name, job);
    job.start();
  }

  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
  }
}

module.exports = { JobScheduler };
```

### Schedule Configuration

```javascript
// config/index.js
module.exports = {
  // ... other config
  cron: {
    youtubeBatchSchedule: process.env.YOUTUBE_BATCH_SCHEDULE || '0 */4 * * *', // Every 4 hours
    reportSchedule: process.env.REPORT_CRON_SCHEDULE || '0 6 * * 1', // Monday 6 AM
    timezone: process.env.TIMEZONE || 'America/New_York',
  },
};
```

### Report Generation Job

```javascript
// jobs/reportGenerator.js
const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const Unit = require('../models/Unit');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class ReportGenerator {
  async run() {
    logger.info('Starting weekly report generation');

    // Find all completed streams from previous day (Sunday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const completedStreams = await StreamEvent.find({
      status: 'completed',
      scheduledDate: {
        $gte: yesterday,
        $lte: endOfYesterday,
      },
    }).populate('unitId');

    for (const stream of completedStreams) {
      await this.generateUnitReport(stream);
    }

    logger.info(`Generated reports for ${completedStreams.length} units`);
  }

  async generateUnitReport(streamEvent) {
    const unit = streamEvent.unitId;

    if (!unit.leadershipEmails || unit.leadershipEmails.length === 0) {
      logger.warn(`No leadership emails configured for unit: ${unit.name}`);
      return;
    }

    // Get attendance for this stream
    const attendance = await AttendanceRecord.find({
      streamEventId: streamEvent._id,
    }).sort({ attendeeName: 1 });

    // Generate attendance analysis
    const report = await this.buildAttendanceReport(unit, streamEvent, attendance);

    // Send email to leadership
    await emailService.sendAttendanceReport(unit.leadershipEmails, report);

    logger.info(`Sent report for ${unit.name} to ${unit.leadershipEmails.length} recipients`);
  }

  async buildAttendanceReport(unit, streamEvent, attendance) {
    // Get historical data for pattern analysis
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentStreams = await StreamEvent.find({
      unitId: unit._id,
      status: 'completed',
      scheduledDate: { $gte: fourWeeksAgo },
    });

    const recentAttendance = await AttendanceRecord.find({
      streamEventId: { $in: recentStreams.map(s => s._id) },
    });

    // Analyze attendance patterns
    const analysis = this.analyzeAttendancePatterns(attendance, recentAttendance);

    return {
      unit: unit.name,
      streamDate: streamEvent.scheduledDate,
      totalAttendees: attendance.reduce((sum, record) => sum + record.attendeeCount, 0),
      uniqueNames: attendance.length,
      attendeeList: attendance.map(record => ({
        name: record.attendeeName,
        count: record.attendeeCount,
      })),
      analysis,
    };
  }

  analyzeAttendancePatterns(currentAttendance, historicalAttendance) {
    // Implementation for pattern analysis
    // - New attendees
    // - Regular streamers
    // - Missing regulars
    // - Returned after absence
    return {
      newThisWeek: [],
      regularStreamers: [],
      missingRegulars: [],
      returnedAfterAbsence: [],
    };
  }
}

module.exports = new ReportGenerator();
```

### YouTube Batch Processing Job

```javascript
// jobs/youtubeBatchProcessor.js
const StreamEvent = require('../models/StreamEvent');
const youtubeService = require('../services/youtubeService');
const logger = require('../utils/logger');

class YouTubeBatchProcessor {
  async processPendingStreams() {
    const correlationId = require('uuid').v4();
    const jobLogger = logger.child({
      correlationId,
      job: 'youtube-batch-processor',
    });

    jobLogger.info('Starting YouTube batch processing');

    // Find pending streams scheduled within next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const pendingStreams = await StreamEvent.find({
      status: 'pending',
      scheduledDateTime: { $lte: nextWeek },
    }).populate('unitId');

    if (pendingStreams.length === 0) {
      jobLogger.info('No pending streams to process');
      return;
    }

    // Process up to 50 streams per batch to manage quota
    const streamsToProcess = pendingStreams.slice(0, 50);

    for (const stream of streamsToProcess) {
      await this.processStream(stream, jobLogger);
    }

    jobLogger.info(`Processed ${streamsToProcess.length} streams`);
  }
}

module.exports = new YouTubeBatchProcessor();
```

### Application Integration

```javascript
// src/app.js
const { JobScheduler } = require('./jobs');

async function startApp() {
  // ... database connection and migrations

  // Start scheduled jobs
  const jobScheduler = new JobScheduler();
  jobScheduler.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    jobScheduler.stop();
    process.exit(0);
  });

  // Start Express server
  app.listen(config.server.port);
}
```

### Admin Interface for Job Management

Global admins can manually trigger jobs through the admin interface:

#### Admin Routes

```javascript
// routes/admin.js
router.post('/youtube/batch', adminController.triggerYoutubeBatch);
router.post('/reports/generate', adminController.triggerReportGeneration);
router.post('/test/setup-report-data', adminController.setupTestReportData);
```

#### Admin Dashboard Component

```javascript
// dashboard/src/pages/Admin.jsx
const Admin = () => {
  const triggerJob = async (jobType, endpoint, description) => {
    // Trigger job via API call
    // Show loading states and success/error messages
  };

  return (
    <div>
      <h2>System Administration</h2>

      {/* YouTube Batch Processing Card */}
      <Card>
        <Card.Header>YouTube Batch Processing</Card.Header>
        <Card.Body>
          <Button onClick={() => triggerJob('youtube', '/api/admin/youtube/batch')}>
            Trigger YouTube Batch
          </Button>
        </Card.Body>
      </Card>

      {/* Weekly Reports Card */}
      <Card>
        <Card.Header>Weekly Reports</Card.Header>
        <Card.Body>
          <Button onClick={() => triggerJob('reports', '/api/admin/reports/generate')}>
            Generate Reports
          </Button>
          <Button onClick={() => triggerJob('testData', '/api/admin/test/setup-report-data')}>
            Setup Test Data
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};
```

### Environment Configuration

```bash
# Cron job settings
REPORT_CRON_SCHEDULE=0 6 * * 1  # Monday 6 AM
CLEANUP_CRON_SCHEDULE=0 7 * * 1  # Monday 7 AM
TIMEZONE=America/New_York
ENABLE_CRON_JOBS=true  # Disable in development if needed
```

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

## Testing Strategy

### Honeycomb Testing Methodology

Following Spotify's approach with emphasis on integration tests, minimal E2E, and targeted unit tests:

```
     /\
    /  \     Few E2E tests (critical user journeys)
   /____\
  /      \
 /        \   Many integration tests (API endpoints, services)
/__________\
            \  Some unit tests (complex logic, edge cases)
```

### Testing Structure

#### Backend Testing

```
api/tests/
├── integration/              # Primary test layer
│   ├── setup/               # Test environment setup
│   │   ├── testcontainers.js # MongoDB + mock services
│   │   ├── fixtures.js      # Test data factories
│   │   └── helpers.js       # Test utilities
│   ├── auth.test.js         # Authentication flows
│   ├── streams.test.js      # Stream management
│   ├── attendance.test.js   # Attendance tracking
│   ├── units.test.js        # Unit management
│   └── public.test.js       # Public API endpoints
├── unit/                    # Targeted unit tests
│   ├── services/           # Complex business logic
│   │   ├── youtubeService.test.js
│   │   ├── reportService.test.js
│   │   └── emailService.test.js
│   ├── utils/              # Utility functions
│   │   ├── validation.test.js
│   │   └── dateHelpers.test.js
│   └── middleware/         # Middleware logic
│       ├── auth.test.js
│       └── validation.test.js
├── e2e/                    # Critical user journeys
│   ├── stream-workflow.test.js # Complete stream lifecycle
│   └── attendance-flow.test.js # Attendance submission flow
├── fixtures/               # Test data
│   ├── units.json         # Sample units
│   ├── users.json         # Sample users
│   └── streams.json       # Sample stream events
└── mocks/                 # Service mocks
    ├── youtube.js         # YouTube API mock
    ├── email.js           # Email service mock
    └── cron.js            # Cron job mock
```

### Testcontainers Setup

```javascript
// tests/integration/setup/testcontainers.js
const { GenericContainer, Wait } = require('testcontainers');
const mongoose = require('mongoose');

class TestEnvironment {
  constructor() {
    this.containers = new Map();
  }

  async setup() {
    // MongoDB container
    const mongoContainer = await new GenericContainer('mongo:7')
      .withEnvironment({
        MONGO_INITDB_ROOT_USERNAME: 'testuser',
        MONGO_INITDB_ROOT_PASSWORD: 'testpass',
      })
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
      .start();

    this.containers.set('mongodb', mongoContainer);

    // MailHog container for email testing
    const mailhogContainer = await new GenericContainer('mailhog/mailhog')
      .withExposedPorts(1025, 8025)
      .withWaitStrategy(Wait.forHttp('/api/v2/messages', 8025))
      .start();

    this.containers.set('mailhog', mailhogContainer);

    // Connect to test database
    const mongoUrl = `mongodb://testuser:testpass@${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}/testdb`;
    await mongoose.connect(mongoUrl);

    return {
      mongoUrl,
      smtpHost: mailhogContainer.getHost(),
      smtpPort: mailhogContainer.getMappedPort(1025),
      mailhogApi: `http://${mailhogContainer.getHost()}:${mailhogContainer.getMappedPort(8025)}`,
    };
  }

  async teardown() {
    await mongoose.disconnect();

    for (const container of this.containers.values()) {
      await container.stop();
    }

    this.containers.clear();
  }
}

module.exports = { TestEnvironment };
```

### Test Data Factories

```javascript
// tests/integration/setup/fixtures.js
const { faker } = require('@faker-js/faker');

class TestDataFactory {
  static createUnit(overrides = {}) {
    return {
      name: faker.company.name() + ' Ward',
      subdomain: faker.internet.domainWord(),
      leadershipEmails: [faker.internet.email()],
      isActive: true,
      ...overrides,
    };
  }

  static createUser(overrides = {}) {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      hashedPassword: '$2b$12$test.hash.here',
      role: 'specialist',
      isActive: true,
      ...overrides,
    };
  }

  static createStreamEvent(unitId, overrides = {}) {
    return {
      unitId,
      scheduledDate: faker.date.future(),
      scheduledTime: '10:00 AM',
      status: 'scheduled',
      isSpecialEvent: false,
      ...overrides,
    };
  }

  static createAttendanceRecord(streamEventId, overrides = {}) {
    return {
      streamEventId,
      attendeeName: faker.person.fullName(),
      attendeeCount: faker.number.int({ min: 1, max: 6 }),
      submittedAt: new Date(),
      ipAddress: faker.internet.ip(),
      ...overrides,
    };
  }
}

module.exports = { TestDataFactory };
```

### Integration Test Example

```javascript
// tests/integration/streams.test.js
const request = require('supertest');
const { TestEnvironment } = require('./setup/testcontainers');
const { TestDataFactory } = require('./setup/fixtures');
const { createApp } = require('../../src/app');
const Unit = require('../../src/models/Unit');
const User = require('../../src/models/User');

describe('Stream Management Integration Tests', () => {
  let testEnv;
  let app;
  let authToken;
  let testUnit;
  let testUser;

  beforeAll(async () => {
    testEnv = new TestEnvironment();
    const config = await testEnv.setup();

    // Create app with test configuration
    app = createApp({
      ...config,
      youtube: { mock: true }, // Use mocked YouTube service
      email: { mock: true }, // Use mocked email service
    });

    // Create test data
    testUnit = await Unit.create(TestDataFactory.createUnit());
    testUser = await User.create(
      TestDataFactory.createUser({
        units: [testUnit._id],
      })
    );

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'testpassword' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  beforeEach(async () => {
    // Clean up stream events between tests
    await mongoose.connection.db.collection('streamevents').deleteMany({});
  });

  describe('POST /api/units/:unitId/streams', () => {
    it('should create a new stream event', async () => {
      const streamData = {
        scheduledDate: '2024-01-07',
        scheduledTime: '10:00 AM',
      };

      const response = await request(app)
        .post(`/api/units/${testUnit._id}/streams`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamData)
        .expect(201);

      expect(response.body).toMatchObject({
        unitId: testUnit._id.toString(),
        scheduledDate: expect.any(String),
        scheduledTime: '10:00 AM',
        status: 'scheduled',
        youtubeEventId: expect.any(String), // Mocked YouTube response
        streamKey: expect.any(String),
      });
    });

    it('should handle YouTube API failures gracefully', async () => {
      // Configure mock to fail
      const streamData = {
        scheduledDate: '2024-01-07',
        scheduledTime: '10:00 AM',
        _mockYouTubeFailure: true,
      };

      const response = await request(app)
        .post(`/api/units/${testUnit._id}/streams`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamData)
        .expect(500);

      expect(response.body.error.code).toBe('YOUTUBE_API_ERROR');
    });
  });

  describe('GET /api/units/:unitId/streams', () => {
    it('should return streams for the unit', async () => {
      // Create test streams
      const stream1 = TestDataFactory.createStreamEvent(testUnit._id);
      const stream2 = TestDataFactory.createStreamEvent(testUnit._id, {
        status: 'completed',
      });

      await StreamEvent.create([stream1, stream2]);

      const response = await request(app)
        .get(`/api/units/${testUnit._id}/streams`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        unitId: testUnit._id.toString(),
        status: expect.any(String),
      });
    });
  });
});
```

### Service Mocks

```javascript
// tests/mocks/youtube.js
class MockYouTubeService {
  constructor() {
    this.shouldFail = false;
    this.events = new Map();
  }

  async createLiveEvent(title, scheduledStartTime) {
    if (this.shouldFail) {
      throw new Error('YouTube API quota exceeded');
    }

    const eventId = `mock-event-${Date.now()}`;
    const event = {
      id: eventId,
      snippet: { title },
      status: { lifeCycleStatus: 'created' },
      cdn: {
        ingestionInfo: {
          streamName: `mock-stream-key-${eventId}`,
        },
      },
    };

    this.events.set(eventId, event);
    return event;
  }

  async deleteEvent(eventId) {
    if (this.shouldFail) {
      throw new Error('YouTube API error');
    }

    this.events.delete(eventId);
  }

  // Test helpers
  setFailureMode(shouldFail) {
    this.shouldFail = shouldFail;
  }

  getCreatedEvents() {
    return Array.from(this.events.values());
  }

  reset() {
    this.events.clear();
    this.shouldFail = false;
  }
}

module.exports = { MockYouTubeService };
```

### Unit Test Example

```javascript
// tests/unit/services/reportService.test.js
const { ReportService } = require('../../../src/services/reportService');
const { TestDataFactory } = require('../../integration/setup/fixtures');

describe('ReportService', () => {
  let reportService;

  beforeEach(() => {
    reportService = new ReportService();
  });

  describe('analyzeAttendancePatterns', () => {
    it('should identify new attendees', () => {
      const currentAttendance = [
        { attendeeName: 'John Doe', attendeeCount: 2 },
        { attendeeName: 'Jane Smith', attendeeCount: 1 },
      ];

      const historicalAttendance = [{ attendeeName: 'John Doe', attendeeCount: 2 }];

      const analysis = reportService.analyzeAttendancePatterns(
        currentAttendance,
        historicalAttendance
      );

      expect(analysis.newThisWeek).toContain('Jane Smith');
      expect(analysis.newThisWeek).not.toContain('John Doe');
    });

    it('should identify regular streamers', () => {
      const currentAttendance = [{ attendeeName: 'Regular Attendee', attendeeCount: 1 }];

      // Mock 4 weeks of attendance
      const historicalAttendance = Array(12)
        .fill(null)
        .map(() => ({
          attendeeName: 'Regular Attendee',
          attendeeCount: 1,
          submittedAt: new Date(),
        }));

      const analysis = reportService.analyzeAttendancePatterns(
        currentAttendance,
        historicalAttendance
      );

      expect(analysis.regularStreamers).toContain('Regular Attendee');
    });
  });
});
```

### Test Configuration

```json
// package.json test scripts
{
  "scripts": {
    "test": "jest",
    "test:integration": "jest tests/integration",
    "test:unit": "jest tests/unit",
    "test:e2e": "jest tests/e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": ["**/*.test.js"],
    "collectCoverageFrom": ["src/**/*.js", "!src/migrations/**", "!src/jobs/**"]
  }
}
```

### Global Test Setup

```javascript
// tests/setup.js
const { TestDataFactory } = require('./integration/setup/fixtures');

// Global test configuration
jest.setTimeout(30000); // Testcontainers can be slow

// Make test data factory available globally
global.TestDataFactory = TestDataFactory;

// Mock external services by default
jest.mock('../src/services/youtubeService', () => {
  const { MockYouTubeService } = require('./mocks/youtube');
  return new MockYouTubeService();
});
```

## Development Tooling

### Code Formatting & Linting

#### Prettier Configuration

```json
// .prettierrc (root level - shared across all services)
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

```gitignore
# .prettierignore (root level)
node_modules/
dist/
build/
coverage/
*.min.js
*.min.css
package-lock.json
```

#### ESLint Configuration

##### API ESLint Config

```json
// api/.eslintrc.json
{
  "env": {
    "node": true,
    "es2022": true,
    "jest": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["node_modules/", "coverage/", "dist/"]
}
```

##### Frontend ESLint Config

```json
// dashboard/.eslintrc.json (same for access/)
{
  "env": {
    "browser": true,
    "es2022": true,
    "jest": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": ["node_modules/", "dist/", "coverage/"]
}
```

### Pre-commit Hooks Setup

#### Husky Configuration

```json
// package.json (root level)
{
  "name": "ldschurch-stream",
  "private": true,
  "workspaces": ["api", "dashboard", "access"],
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.1"
  },
  "scripts": {
    "prepare": "husky install",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "test": "npm test --workspaces"
  }
}
```

#### Lint-staged Configuration

```json
// .lintstagedrc.json (root level)
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "api/**/*.js": ["cd api && npm run lint:fix"],
  "dashboard/**/*.{js,jsx}": ["cd dashboard && npm run lint:fix"],
  "access/**/*.{js,jsx}": ["cd access && npm run lint:fix"]
}
```

#### Git Hooks

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Service-Level Package.json Scripts

#### API Scripts

```json
// api/package.json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write src/ tests/",
    "format:check": "prettier --check src/ tests/"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "prettier": "^3.1.1",
    "supertest": "^6.3.3"
  }
}
```

#### Frontend Scripts

```json
// dashboard/package.json (same for access/)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

### IDE Configuration

#### VSCode Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": ["api", "dashboard", "access"],
  "files.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true
  }
}
```

#### VSCode Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### CI Integration Updates

#### Updated Test Workflow

```yaml
# .github/workflows/test.yml (addition to existing)
jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Check Prettier formatting
        run: npm run format:check

      - name: Run ESLint
        run: npm run lint

  test:
    needs: lint-and-format # Ensure linting passes before tests
    runs-on: ubuntu-latest
    # ... rest of existing test job
```

### Development Workflow

#### Setup Commands

```bash
# Initial setup
npm install                    # Install root dependencies and setup husky
npm run prepare               # Setup git hooks

# Development commands
npm run format                # Format all files
npm run format:check          # Check formatting without fixing
npm run lint                  # Lint all services
npm run lint:fix              # Fix linting issues
npm test                      # Run all tests

# Service-specific commands
cd api && npm run lint:fix    # Lint specific service
cd dashboard && npm run format # Format specific service
```

### Git Workflow Integration

```bash
# Pre-commit hook automatically runs:
# 1. ESLint with --fix on staged JS/JSX files
# 2. Prettier formatting on staged files
# 3. Service-specific linting for changed files

# Manual verification
git add .
git commit -m "feat: add new feature"  # Triggers pre-commit hooks

# CI verification
# - Pull requests run lint-and-format job before tests
# - Main branch deployments include linting validation
```

### Configuration Files Structure

```
ldschurch-stream/
├── .prettierrc               # Shared Prettier config
├── .prettierignore          # Prettier ignore patterns
├── .lintstagedrc.json       # Lint-staged configuration
├── .husky/
│   └── pre-commit           # Git pre-commit hook
├── .vscode/
│   ├── settings.json        # VSCode workspace settings
│   └── extensions.json      # Recommended extensions
├── package.json             # Root workspace config
├── api/
│   ├── .eslintrc.json       # API-specific ESLint config
│   └── package.json         # API dependencies and scripts
├── dashboard/
│   ├── .eslintrc.json       # Dashboard ESLint config
│   └── package.json         # Dashboard dependencies and scripts
└── access/
    ├── .eslintrc.json       # Access app ESLint config
    └── package.json         # Access app dependencies and scripts
```

## Development Workflow Guidelines

### Container-Based Development

**IMPORTANT**: This application runs entirely in Docker containers with Compose Watch for hot reloading. When making changes:

- **File changes are automatically synced** - No manual restarts needed for most code changes
- **Package.json changes trigger rebuilds** - Compose Watch handles dependency updates automatically
- **No host npm commands** - All npm operations happen inside containers
- **No manual container restarts** - Compose Watch manages the development lifecycle

### Making Changes

```bash
# ✅ Correct: Edit files directly, changes sync automatically
vim api/src/controllers/streams.js

# ✅ Correct: Add dependencies (triggers automatic rebuild)
echo '"new-package": "^1.0.0"' >> api/package.json

# ❌ Avoid: Manual npm commands on host
npm install  # Don't do this

# ❌ Avoid: Manual container restarts
docker compose restart api  # Usually unnecessary

# ✅ Only restart if containers are stuck/corrupted
docker compose up --watch  # Restart entire stack if needed
```

### When Restarts ARE Needed

- Environment variable changes in compose.yaml
- Docker configuration changes (Dockerfile, compose.yaml)
- Database schema changes requiring migration
- Container corruption or networking issues

## API Documentation

### OpenAPI Documentation Setup

Using code-generated OpenAPI documentation with JSDoc comments for maintainability.

#### Swagger Configuration

```javascript
// api/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LDSChurch.Stream API',
      version: '1.0.0',
      description: 'API for managing LDS Church streaming services',
      contact: {
        name: 'Support',
        email: 'support@ldschurch.stream',
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://api.ldschurch.stream'
            : 'http://api.traefik.me',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                correlationId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
```

#### Express Integration

```javascript
// api/src/app.js
const { specs, swaggerUi } = require('./config/swagger');

// Swagger documentation endpoint
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LDSChurch.Stream API Documentation',
  })
);

// JSON spec endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});
```

### Route Documentation Examples

#### Authentication Routes

```javascript
// api/src/routes/auth.js
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController.login);
```

#### Stream Management Routes

```javascript
// api/src/routes/units.js
/**
 * @swagger
 * /api/units/{unitId}/streams:
 *   get:
 *     summary: Get streams for a unit
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, live, completed, cancelled]
 *         description: Filter by stream status
 *     responses:
 *       200:
 *         description: List of stream events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StreamEvent'
 *   post:
 *     summary: Create a new stream event
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStreamRequest'
 *     responses:
 *       201:
 *         description: Stream event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamEvent'
 */
```

#### Public API Routes

```javascript
// api/src/routes/public.js
/**
 * @swagger
 * /api/public/{subdomain}/current-stream:
 *   get:
 *     summary: Get current stream for a unit
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: subdomain
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit subdomain (e.g., blacksburg-va)
 *     responses:
 *       200:
 *         description: Current stream information
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ActiveStream'
 *                 - $ref: '#/components/schemas/SpecialEvent'
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/public/{subdomain}/attend:
 *   post:
 *     summary: Submit attendance for a stream
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: subdomain
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceSubmission'
 *     responses:
 *       201:
 *         description: Attendance recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 streamUrl:
 *                   type: string
 */
```

### Model Documentation

```javascript
// api/src/models/StreamEvent.js
/**
 * @swagger
 * components:
 *   schemas:
 *     StreamEvent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         unitId:
 *           type: string
 *         scheduledDate:
 *           type: string
 *           format: date
 *         scheduledTime:
 *           type: string
 *           example: "10:00 AM"
 *         youtubeEventId:
 *           type: string
 *           nullable: true
 *         youtubeStreamUrl:
 *           type: string
 *           nullable: true
 *         streamKey:
 *           type: string
 *         status:
 *           type: string
 *           enum: [scheduled, live, completed, cancelled]
 *         isSpecialEvent:
 *           type: boolean
 *         specialEventMessage:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateStreamRequest:
 *       type: object
 *       required:
 *         - scheduledDate
 *         - scheduledTime
 *       properties:
 *         scheduledDate:
 *           type: string
 *           format: date
 *         scheduledTime:
 *           type: string
 *         isSpecialEvent:
 *           type: boolean
 *           default: false
 *         specialEventMessage:
 *           type: string
 */

const streamEventSchema = new mongoose.Schema({
  // ... existing schema definition
});
```

### Package.json Dependencies

```json
// api/package.json
{
  "dependencies": {
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:serve": "swagger-ui-serve api/docs/openapi.json"
  }
}
```

### Documentation Generation Script

```javascript
// api/scripts/generate-docs.js
const fs = require('fs');
const path = require('path');
const { specs } = require('../src/config/swagger');

// Generate static OpenAPI JSON file
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(path.join(docsDir, 'openapi.json'), JSON.stringify(specs, null, 2));

console.log('OpenAPI documentation generated at docs/openapi.json');
```

### Documentation URLs

```bash
# Development
http://api.traefik.me/api/docs          # Swagger UI
http://api.traefik.me/api/docs.json     # OpenAPI JSON spec

# Production
https://api.ldschurch.stream/api/docs          # Swagger UI
https://api.ldschurch.stream/api/docs.json     # OpenAPI JSON spec
```

### CI Integration

```yaml
# .github/workflows/build-and-deploy.yml (addition)
- name: Generate API documentation
  run: |
    cd api
    npm run docs:generate

- name: Upload documentation artifact
  uses: actions/upload-artifact@v3
  with:
    name: api-documentation
    path: api/docs/openapi.json
```

### Documentation Structure

```
api/
├── src/
│   ├── config/
│   │   └── swagger.js           # Swagger configuration
│   ├── routes/                  # Route files with JSDoc comments
│   └── models/                  # Model files with schema docs
├── docs/
│   └── openapi.json            # Generated OpenAPI spec
└── scripts/
    └── generate-docs.js        # Documentation generation script
```

## Logging & Request Correlation

### Structured Logging Setup

```javascript
// api/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'ldschurch-stream-api',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Production: Add file transports
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

module.exports = logger;
```

### Request Correlation Middleware

```javascript
// api/src/middleware/correlation.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const correlationMiddleware = (req, res, next) => {
  // Use existing correlation ID or generate new one
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();

  // Add to response headers for client tracking
  res.setHeader('x-correlation-id', req.correlationId);

  // Create request-scoped logger
  req.logger = logger.child({
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Log incoming request
  req.logger.info('Request started', {
    body: req.method === 'POST' ? req.body : undefined,
  });

  // Track response time
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = correlationMiddleware;
```

### Enhanced Error Handler with Correlation

```javascript
// api/src/middleware/errorHandler.js
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

  // Use request logger if available, fallback to global logger
  const requestLogger = req.logger || logger;

  // Log error with correlation context
  requestLogger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    statusCode: error.statusCode || 500,
    code: error.code,
    userId: req.user?.id,
    unitId: req.params?.unitId,
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
      correlationId: req.correlationId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { AppError, errorHandler };
```

### Service Layer Logging

```javascript
// api/src/services/youtubeService.js
const logger = require('../utils/logger');

class YouTubeService {
  constructor() {
    this.logger = logger.child({ service: 'youtube' });
  }

  async createLiveEvent(title, scheduledStartTime, correlationId) {
    const requestLogger = this.logger.child({ correlationId });

    requestLogger.info('Creating YouTube Live event', {
      title,
      scheduledStartTime,
    });

    try {
      const response = await this.youtube.liveBroadcasts.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            scheduledStartTime,
          },
          status: {
            privacyStatus: 'unlisted',
          },
        },
      });

      requestLogger.info('YouTube Live event created successfully', {
        eventId: response.data.id,
        title: response.data.snippet.title,
      });

      return response.data;
    } catch (error) {
      requestLogger.error('Failed to create YouTube Live event', {
        error: error.message,
        title,
        quotaExceeded: error.code === 403,
      });
      throw error;
    }
  }
}
```

### Controller Logging Pattern

```javascript
// api/src/controllers/streams.js
const StreamEvent = require('../models/StreamEvent');
const youtubeService = require('../services/youtubeService');

const createStream = async (req, res, next) => {
  try {
    req.logger.info('Creating new stream event', {
      unitId: req.params.unitId,
      scheduledDate: req.body.scheduledDate,
      userId: req.user.id,
    });

    // Create YouTube event with correlation ID
    const youtubeEvent = await youtubeService.createLiveEvent(
      `${req.unit.name} - ${req.body.scheduledDate}`,
      req.body.scheduledDate,
      req.correlationId
    );

    const streamEvent = await StreamEvent.create({
      unitId: req.params.unitId,
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      youtubeEventId: youtubeEvent.id,
      youtubeStreamUrl: youtubeEvent.snippet.thumbnails?.default?.url,
      streamKey: youtubeEvent.cdn?.ingestionInfo?.streamName,
    });

    req.logger.info('Stream event created successfully', {
      streamEventId: streamEvent._id,
      youtubeEventId: youtubeEvent.id,
    });

    res.status(201).json(streamEvent);
  } catch (error) {
    next(error);
  }
};
```

### Frontend Correlation Integration

```javascript
// dashboard/src/services/api.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// API instance will be configured after config loads
let api;

export const initializeApi = config => {
  api = axios.create({
    baseURL: config.apiUrl,
  });

  // Add correlation ID to all requests
  api.interceptors.request.use(config => {
    // Generate or reuse correlation ID
    if (!config.headers['x-correlation-id']) {
      config.headers['x-correlation-id'] = uuidv4();
    }

    return config;
  });

  // Log API errors with correlation ID
  api.interceptors.response.use(
    response => response,
    error => {
      const correlationId = error.response?.headers['x-correlation-id'];

      console.error('API request failed', {
        correlationId,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });

      return Promise.reject(error);
    }
  );

  return api;
};

export const getApi = () => {
  if (!api) {
    throw new Error('API not initialized. Call initializeApi first.');
  }
  return api;
};

// Log API errors with correlation ID
api.interceptors.response.use(
  response => response,
  error => {
    const correlationId = error.response?.headers['x-correlation-id'];

    console.error('API request failed', {
      correlationId,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error?.message,
    });

    return Promise.reject(error);
  }
);

export default api;
```

### Cron Job Logging

```javascript
// api/src/jobs/reportGenerator.js
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ReportGenerator {
  async run() {
    const correlationId = uuidv4();
    const jobLogger = logger.child({
      correlationId,
      job: 'report-generator',
    });

    jobLogger.info('Starting weekly report generation');

    try {
      const completedStreams = await this.findCompletedStreams();

      jobLogger.info('Found streams to process', {
        count: completedStreams.length,
      });

      for (const stream of completedStreams) {
        await this.generateUnitReport(stream, jobLogger);
      }

      jobLogger.info('Weekly report generation completed', {
        processedUnits: completedStreams.length,
      });
    } catch (error) {
      jobLogger.error('Weekly report generation failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async generateUnitReport(streamEvent, parentLogger) {
    const unitLogger = parentLogger.child({
      unitId: streamEvent.unitId._id,
      unitName: streamEvent.unitId.name,
      streamEventId: streamEvent._id,
    });

    unitLogger.info('Generating unit report');

    try {
      // Report generation logic...

      unitLogger.info('Unit report generated successfully', {
        attendeeCount: attendance.length,
        emailsSent: unit.leadershipEmails.length,
      });
    } catch (error) {
      unitLogger.error('Failed to generate unit report', {
        error: error.message,
      });
      throw error;
    }
  }
}
```

### Application Integration

```javascript
// api/src/app.js
const express = require('express');
const correlationMiddleware = require('./middleware/correlation');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Apply correlation middleware early
app.use(correlationMiddleware);

// ... other middleware

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown logging
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});
```

### Log Aggregation Configuration

```yaml
# compose.yaml (development)
services:
  api:
    # ... existing config
    volumes:
      - ./api/logs:/app/logs # Mount logs directory
    environment:
      - LOG_LEVEL=debug

  # Optional: Add log aggregation for development
  loki:
    image: grafana/loki:latest
    ports: ['3100:3100']
    command: -config.file=/etc/loki/local-config.yaml
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.loki.rule=Host(`logs.traefik.me`)'
      - 'traefik.http.services.loki.loadbalancer.server.port=3100'
```

### Production Logging Environment

```bash
# Production environment variables
LOG_LEVEL=info
APP_VERSION=1.0.0

# Kubernetes: Use stdout/stderr for container logs
# Logs collected by cluster logging (Fluentd, Logstash, etc.)
```

## Local Development Setup

### Docker Compose Configuration

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
    volumes:
      - mongodb_data:/data/db
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
    depends_on:
      - mongodb

  mailhog:
    image: mailhog/mailhog
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mailhog.rule=Host(`mail.traefik.me`)'
      - 'traefik.http.services.mailhog.loadbalancer.server.port=8025'

  api:
    build:
      context: ./api
      target: dev
    environment:
      - NODE_ENV=development
      - MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
      - CORS_ORIGINS=http://dashboard.traefik.me,http://api.traefik.me
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.api.rule=Host(`api.traefik.me`)'
      - 'traefik.http.services.api.loadbalancer.server.port=3000'
    depends_on:
      - mongodb
      - mailhog
    develop:
      watch:
        - action: sync
          path: ./api/src
          target: /app/src
        - action: rebuild
          path: ./api/package.json

  dashboard:
    build:
      context: ./dashboard
      target: dev
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.dashboard.rule=Host(`dashboard.traefik.me`)'
      - 'traefik.http.services.dashboard.loadbalancer.server.port=5173'
    depends_on:
      - api
    develop:
      watch:
        - action: sync
          path: ./dashboard/src
          target: /app/src
        - action: sync
          path: ./dashboard/public
          target: /app/public
        - action: rebuild
          path: ./dashboard/package.json

  access:
    build:
      context: ./access
      target: dev
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.access.rule=HostRegexp(`{subdomain:[a-z0-9-]+}.traefik.me`)'
      - 'traefik.http.services.access.loadbalancer.server.port=5173'
    depends_on:
      - api
    develop:
      watch:
        - action: sync
          path: ./access/src
          target: /app/src
        - action: sync
          path: ./access/public
          target: /app/public
        - action: rebuild
          path: ./access/package.json

volumes:
  mongodb_data:
```

### Multi-stage Dockerfile Pattern

#### API Dockerfile

```dockerfile
# api/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

#### Frontend Dockerfile

```dockerfile
# dashboard/Dockerfile (same for access/)
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS builder
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Package.json Scripts for Development

```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "dev:watch": "nodemon --watch src src/app.js",
    "start": "node src/app.js"
  }
}
```

### Local Development URLs

- **Traefik Dashboard**: http://traefik.traefik.me
- **API**: http://api.traefik.me
- **Stream Dashboard**: http://dashboard.traefik.me
- **Database Admin**: http://db.traefik.me
- **Email Testing**: http://mail.traefik.me
- **Stream Access Examples**:
  - http://blacksburg-va.traefik.me
  - http://provo-ut.traefik.me
  - http://any-unit.traefik.me

### Development Commands

```bash
# Start all services with hot reload
docker compose up --watch

# Start specific service with logs
docker compose up api --watch

# Rebuild after dependency changes
docker compose build api

# View logs
docker compose logs -f api
```

### Secret Management for Development

```bash
secrets/
├── jwt_secret.txt
├── jwt_refresh_secret.txt
├── youtube_api_key.txt
├── youtube_client_id.txt
├── youtube_client_secret.txt
├── smtp_user.txt
├── smtp_pass.txt
└── .gitignore  # Ensure secrets aren't committed
```

### Environment File Templates

```bash
# api/.env.example
NODE_ENV=development
PORT=3000
MONGODB_URL=mongodb://admin:password@mongodb:27017/ldschurch-stream
JWT_SECRET_FILE=/run/secrets/jwt_secret
YOUTUBE_API_KEY_FILE=/run/secrets/youtube_api_key
SMTP_HOST=mailhog
SMTP_PORT=1025
FROM_EMAIL=noreply@ldschurch.stream
CORS_ORIGINS=http://dashboard.traefik.me,http://api.traefik.me
```

### Frontend Configuration Files

Frontend apps use runtime configuration instead of build-time environment variables:

```json
// dashboard/public/config.json (development)
{
  "apiUrl": "http://api.traefik.me",
  "appName": "LDSChurch.Stream Dashboard"
}

// access/public/config.json (development)
{
  "apiUrl": "http://api.traefik.me",
  "appName": "LDSChurch.Stream Access"
}
```

### React Bootstrap Import Optimization

All React Bootstrap components use direct imports to reduce bundle size:

```javascript
// Optimized imports (required)
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

// Avoided imports (blocked by ESLint)
import { Button, Card, Form } from 'react-bootstrap'; // ❌ ESLint error
```

ESLint rule enforces this pattern:

```json
"no-restricted-imports": [
  "error",
  {
    "paths": [
      {
        "name": "react-bootstrap",
        "message": "Import specific components from 'react-bootstrap/ComponentName' instead to reduce bundle size."
      }
    ]
  }
]
```

This structure ensures consistency across all three applications while maintaining clear separation of concerns and following modern development practices.
