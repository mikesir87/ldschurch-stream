# YouTube API Integration Setup

This document explains how to set up the YouTube API integration for LDSChurch.Stream.

## Prerequisites

1. **Google Cloud Project**: Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. **YouTube Data API v3**: Enable the YouTube Data API v3 in your project
3. **OAuth 2.0 Credentials**: Create OAuth 2.0 client credentials

## Setup Steps

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Choose "Desktop application" as the application type
5. Download the JSON file with your credentials

### 2. Set Environment Variables

From the downloaded JSON file, extract the `client_id` and `client_secret`:

```bash
export YOUTUBE_CLIENT_ID="your-client-id"
export YOUTUBE_CLIENT_SECRET="your-client-secret"
```

### 3. Generate Access Tokens

Run the OAuth setup script to generate access and refresh tokens:

```bash
cd api
npm run youtube:setup
```

This will:

1. Open a browser window for Google OAuth
2. Ask you to authorize the application
3. Generate access and refresh tokens
4. Display the tokens for you to save

### 4. Store Tokens Securely

#### For Development (Docker Secrets)

Create the secret files:

```bash
mkdir -p secrets
echo "your-client-id" > secrets/youtube_client_id.txt
echo "your-client-secret" > secrets/youtube_client_secret.txt
echo "your-access-token" > secrets/youtube_access_token.txt
echo "your-refresh-token" > secrets/youtube_refresh_token.txt
```

#### For Production (Kubernetes Secrets)

```bash
kubectl create secret generic ldschurch-stream-secrets \
  --from-literal=youtube_client_id="your-client-id" \
  --from-literal=youtube_client_secret="your-client-secret" \
  --from-literal=youtube_access_token="your-access-token" \
  --from-literal=youtube_refresh_token="your-refresh-token" \
  -n ldschurch-stream
```

## How It Works

1. **Stream Creation**: When a stream specialist creates a new stream event, the API calls YouTube to create a Live Broadcast and Live Stream
2. **Stream Key**: YouTube provides a unique RTMP stream key that OBS uses to stream
3. **Auto-Management**: YouTube events are set to auto-start and auto-stop
4. **Privacy**: All streams are created as "Unlisted" for privacy
5. **Cleanup**: Events are automatically deleted 24 hours after completion

## Troubleshooting

### "YouTube access token required" Error

This means the OAuth tokens haven't been set up. Run `npm run youtube:setup` to generate them.

### "Invalid credentials" Error

The OAuth tokens may have expired or been revoked. Re-run the setup process to generate new tokens.

### "Quota exceeded" Error

YouTube API has daily quotas. If you hit the limit, you'll need to wait until the next day or request a quota increase from Google.

## API Quotas

- **Live Broadcasts Insert**: 1600 units per request
- **Live Streams Insert**: 1600 units per request
- **Live Broadcasts Bind**: 50 units per request
- **Daily Quota**: 10,000 units by default

Each stream creation uses approximately 3,250 quota units, so you can create about 3 streams per day with the default quota.
