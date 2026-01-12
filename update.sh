#!/bin/bash
# Update script for Greek Dance Festival
# Run this on your server to pull and deploy updates

set -e  # Exit on error

echo "🔄 Updating Greek Dance Festival..."

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run any new database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️  Building application..."
npm run build

# Restart the application
echo "♻️  Restarting application..."
pm2 restart greek-dance-festival

echo "✅ Update complete!"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs greek-dance-festival"
