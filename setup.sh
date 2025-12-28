#!/bin/bash

echo "🏗️  Setting up LDSChurch.Stream development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup git hooks
echo "🪝 Setting up git hooks..."
npx husky install

# Create development environment file if it doesn't exist
if [ ! -f "api/.env" ]; then
    echo "📝 Creating API environment file..."
    cp api/.env.example api/.env
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development environment:"
echo "   docker compose up --watch"
echo ""
echo "🌐 Development URLs:"
echo "   Landing Page:     http://ldschurch.traefik.me"
echo "   Stream Dashboard: http://dashboard.traefik.me"
echo "   API:              http://api.traefik.me"
echo "   Database Admin:   http://db.traefik.me"
echo "   Email Testing:    http://mail.traefik.me"
echo "   Stream Access:    http://blacksburg-va.traefik.me (example)"
echo ""
echo "📚 Don't forget to:"
echo "   1. Update YouTube API credentials in secrets/ directory"
echo "   2. Configure SMTP settings for email functionality"
echo "   3. Review the README.md for detailed setup instructions"
