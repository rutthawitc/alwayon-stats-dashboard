### วิธี deploy ด้วย PM2:

สร้าง ecosystem.config.js:

ecosystem.config.js

```
module.exports = {
  apps: [
    {
      name: 'alwayon-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3005', // กำหนด port ที่ต้องการ
      instances: '1',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/output.log',
      time: true
    }
  ],
};
```

### สร้าง deploy script:

deploy.sh

```
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
```

### ขั้นตอนการ Deploy:

# 1. บน Production Server

# ติดตั้ง Node.js ถ้ายังไม่มี

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง yarn

corepack enable
corepack prepare yarn@stable --activate

# ติดตั้ง PM2 globally

npm install -g pm2

# Clone repository

git clone <your-repo> /path/to/app
cd /path/to/app

# ให้สิทธิ์ execute deploy script

chmod +x deploy.sh

# รัน deploy script

./deploy.sh

### คำสั่ง PM2 ที่ใช้บ่อย:

# ดู status

pm2 status

# ดู logs

pm2 logs alwayon-dashboard

# ดู logs แบบ realtime

pm2 logs alwayon-dashboard --follow

# restart application

pm2 restart alwayon-dashboard

# reload application (zero downtime)

pm2 reload alwayon-dashboard

# stop application

pm2 stop alwayon-dashboard

# remove application

pm2 delete alwayon-dashboard

# ดู metrics

pm2 monit

# ดู dashboard

pm2 plus

### การ Monitor และ Maintenance:

bashCopy# ตรวจสอบ memory usage
pm2 monit

# Rotate logs

pm2 install pm2-logrotate

# Update application

git pull
yarn install
yarn build
pm2 reload alwayon-dashboard

# Backup logs

tar -czf pm2-logs-backup-$(date +%Y%m%d).tar.gz logs/

### การตั้งค่า Nginx (ถ้าใช้):

/etc/nginx/sites-available/alwayon-dashboard

```
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static content
        location /_next/static {
            proxy_cache STATIC;
            proxy_pass http://localhost:3005;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

### ข้อดีของการใช้ PM2:s

- Zero-downtime reloads
- Auto-restart เมื่อ application crash
- Load balancing ด้วย cluster mode
- Built-in monitoring
- Log management
- Process management
