#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Starting deployment process..."

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the application
echo "🏗️ Building application..."
yarn build

# Start or restart PM2
if pm2 status | grep -q "alwayon-dashboard"; then
    echo "♻️ Restarting existing PM2 process..."
    pm2 reload ecosystem.config.js --env production
else
    echo "🆕 Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production
fi

# Save PM2 process list and generate startup script
pm2 save
pm2 startup

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo "📊 Current PM2 processes:"
pm2 list

# Show recent logs
echo "📜 Recent logs:"
pm2 logs --lines 10