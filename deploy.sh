#!/bin/bash
# Deployment script for Greek Dance Festival
# Run this on your server after cloning the repository

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Start or restart the application
echo "🎯 Starting application with PM2..."
if pm2 list | grep -q "greek-dance-festival"; then
    pm2 restart greek-dance-festival
else
    pm2 start npm --name "greek-dance-festival" -- start
    pm2 save
fi

echo "✅ Deployment complete!"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs greek-dance-festival"
