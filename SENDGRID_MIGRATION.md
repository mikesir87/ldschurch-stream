# SendGrid Migration

This document outlines the migration from SMTP-based email sending to SendGrid.

## Changes Made

### 1. Email Service Migration

- Replaced `nodemailer` with `@sendgrid/mail` package
- Updated `EmailService` class to use SendGrid API format
- Changed configuration from SMTP settings to SendGrid API key

### 2. SendGrid Mock Service

- Created `sendgrid-mock/` service to replace MailHog for local development
- Provides web interface at http://mail.traefik.me to view sent emails
- Mimics SendGrid API endpoints for seamless local testing

### 3. Configuration Updates

- **Environment Variables**:
  - Removed: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER_FILE`, `SMTP_PASS_FILE`
  - Added: `SENDGRID_API_KEY_FILE`, `SENDGRID_MOCK_HOST`
- **Docker Compose**: Updated to use `sendgrid-mock` instead of `mailhog`
- **Kubernetes**: Updated secrets and deployment to use SendGrid API key

### 4. UI Updates

- Updated admin dashboard to reference "SendGrid Configuration Test" instead of "SMTP Configuration Test"

## Local Development

### Starting the Environment

```bash
docker compose up --watch
```

### Accessing Services

- **SendGrid Mock Interface**: http://mail.traefik.me
- **API Documentation**: http://api.traefik.me/api/docs
- **Dashboard**: http://dashboard.traefik.me

### Testing Email Functionality

1. Go to the admin dashboard
2. Navigate to "SendGrid Configuration Test"
3. Enter a test email address
4. Check http://mail.traefik.me to see the sent email

## Production Deployment

### 1. Update Secrets

Create a new secret with your SendGrid API key:

```bash
# Create base64 encoded SendGrid API key
echo -n "your-sendgrid-api-key" | base64

# Update k8s/secrets.yaml with the encoded value
kubectl apply -f k8s/secrets.yaml
```

### 2. Deploy Updated Configuration

```bash
kubectl apply -f k8s/api-deployment.yaml
```

### 3. Environment Variables for Production

```bash
SENDGRID_API_KEY_FILE=/run/secrets/app/sendgrid_api_key
FROM_EMAIL=noreply@ldschurch.stream
```

## SendGrid Setup

### 1. Create SendGrid Account

1. Sign up at https://sendgrid.com
2. Verify your domain or sender identity
3. Create an API key with "Mail Send" permissions

### 2. Configure API Key

- **Development**: Set `SENDGRID_API_KEY=mock-api-key` (uses mock service)
- **Production**: Set `SENDGRID_API_KEY_FILE` to point to secret file containing real API key

## Benefits of SendGrid Migration

1. **Production Compatibility**: Works in environments that block SMTP ports
2. **Better Deliverability**: SendGrid provides better email delivery rates
3. **Analytics**: SendGrid provides email analytics and tracking
4. **Scalability**: Better handling of bulk email sending
5. **Reliability**: More reliable than self-managed SMTP

## Rollback Plan

If needed, you can rollback by:

1. Reverting the `api/package.json` to use `nodemailer`
2. Reverting the `EmailService` class changes
3. Updating environment variables back to SMTP configuration
4. Switching Docker Compose back to `mailhog`
