#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 Updating Basictrick Website on VPS..."
echo "=========================================="

# 1. Move to app directory
cd /var/www/basictrickhub

# 2. Pull latest code
echo "📥 [1/4] Pulling latest code from GitHub..."
git pull origin main

# 3. Install packages
echo "📦 [2/4] Installing dependencies..."
npm install

# 4. Build application
echo "🔨 [3/4] Building production bundle..."
npm run build

# 5. Restart PM2
echo "🔄 [4/4] Restarting PM2 process..."
pm2 restart basictrickhub || pm2 start "npm run start" --name "basictrickhub"

echo "=========================================="
echo "🎉 Update completed successfully!"
echo "🌐 Live site: https://basictrickhub.com"
echo "=========================================="
pm2 status basictrickhub