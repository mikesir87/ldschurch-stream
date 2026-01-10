#!/usr/bin/env node

/**
 * YouTube OAuth2 Token Generator
 *
 * This script helps generate the initial OAuth2 tokens needed for YouTube API access.
 * Run this script once to get the access and refresh tokens, then store them securely.
 *
 * Usage:
 *   node scripts/youtube-oauth.js
 */

const { google } = require('googleapis');
const readline = require('readline');

// You'll need to set these from your Google Cloud Console
const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost'; // For installed applications

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Scopes needed for YouTube Live streaming
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

async function generateTokens() {
  // Generate the auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });

  console.log('1. Open this URL in your browser:');
  console.log(authUrl);
  console.log('\n2. Complete the authorization process');
  console.log('3. Copy the authorization code and paste it below\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code: ', async code => {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log('\n✅ Tokens generated successfully!');
      console.log('\nAdd these to your secrets or environment variables:');
      console.log('YOUTUBE_ACCESS_TOKEN=' + tokens.access_token);
      console.log('YOUTUBE_REFRESH_TOKEN=' + tokens.refresh_token);

      console.log('\nFor Docker secrets, create these files:');
      console.log('echo "' + tokens.access_token + '" > secrets/youtube_access_token.txt');
      console.log('echo "' + tokens.refresh_token + '" > secrets/youtube_refresh_token.txt');
    } catch (error) {
      console.error('Error getting tokens:', error.message);
    }

    rl.close();
  });
}

generateTokens();
