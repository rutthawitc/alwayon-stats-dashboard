#!/bin/bash

echo "🚀 Starting deployment process..."

# สร้าง logs directory
mkdir -p logs

# หยุด PM2 process เดิม
pm2 stop alwayon-dashboard
pm2 delete alwayon-dashboard

# Clear ทุกอย่าง
rm -rf .next
rm -rf node_modules
rm -f yarn.lock

# ติดตั้ง dependencies ใหม่
echo "📦 Installing dependencies..."
export NODE_ENV=production
yarn install --frozen-lockfile

# Build
echo "🏗️ Building application..."
yarn build

# Start PM2
echo "🚀 Starting PM2..."
pm2 start ecosystem.config.js

# ดู logs
echo "📋 Checking logs..."
pm2 logs alwayon-dashboard --lines 50