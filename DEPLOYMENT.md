# 🚀 Deployment Guide - Greek Dance Festival

This guide will help you deploy your Next.js app to a Node.js hosting environment.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18.x or higher on your server
- Git installed (locally and on server)
- Access to your hosting control panel
- A domain name (optional but recommended)

---

## 🔧 Step 1: Install Git (Windows)

### Option A: Download from Official Site
1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Use default settings (click Next through the wizard)
4. Restart your terminal/VS Code after installation

### Option B: Using winget (Windows Package Manager)
```powershell
winget install --id Git.Git -e --source winget
```

### Verify Installation
```powershell
git --version
```

---

## 🔐 Step 2: Configure Git

Open a new terminal and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## 📁 Step 3: Initialize Git Repository

Navigate to your project folder and run:

```powershell
cd "c:\Users\giann\Greek Dance Festival"
git init
git add .
git commit -m "Initial commit - Greek Dance Festival app"
```

---

## ☁️ Step 4: Create Remote Repository

### Option A: GitHub
1. Go to https://github.com/new
2. Name it `greek-dance-festival`
3. Keep it **Private** (recommended)
4. Don't add README, .gitignore, or license (you already have them)
5. Click "Create repository"

### Option B: Other Git Hosts
- GitLab: https://gitlab.com/projects/new
- Bitbucket: https://bitbucket.org/repo/create

---

## 🔗 Step 5: Connect & Push to Remote

After creating the repository, run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/greek-dance-festival.git
git branch -M main
git push -u origin main
```

For SSH (recommended for frequent pushes):
```powershell
git remote add origin git@github.com:YOUR_USERNAME/greek-dance-festival.git
```

---

## 🖥️ Step 6: Server Setup

### Connect to your server (via SSH or hosting panel terminal):

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/greek-dance-festival.git
cd greek-dance-festival

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create production database
npx prisma migrate deploy

# Build the application
npm run build
```

---

## ⚙️ Step 7: Configure Environment Variables

Create a `.env` file on your server with **production values**:

```bash
# On your server, create .env file
nano .env
```

Add these variables (replace with your actual values):

```env
# Database - Use absolute path for SQLite on server
DATABASE_URL="file:/var/www/greek-dance-festival/prisma/prod.db"

# Security Keys (IMPORTANT: Generate new secure keys!)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-new-super-secret-jwt-key-minimum-32-chars
NEXTAUTH_SECRET=your-new-nextauth-secret-minimum-32-chars

# Your production URL
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth (update callback URL in Google Console too!)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

### Generate Secure Keys
Run this command to generate secure random keys:
```bash
openssl rand -base64 32
```
Or on Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## 🚀 Step 8: Start the Application

### Option A: Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start npm --name "greek-dance-festival" -- start

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup
```

### Option B: Using systemd (Linux)

Create a service file:
```bash
sudo nano /etc/systemd/system/greek-dance-festival.service
```

Add:
```ini
[Unit]
Description=Greek Dance Festival Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/greek-dance-festival
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable greek-dance-festival
sudo systemctl start greek-dance-festival
```

### Option C: Simple Start (Testing)
```bash
NODE_ENV=production npm start
```

---

## 🌐 Step 9: Configure Reverse Proxy (Nginx)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Step 10: Enable HTTPS (SSL)

Using Let's Encrypt (free SSL):

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (usually automatic, but verify)
sudo certbot renew --dry-run
```

---

## 🔄 Step 11: Deploying Updates

When you make changes locally:

```powershell
# On your local machine
git add .
git commit -m "Description of changes"
git push
```

On your server:
```bash
cd /var/www/greek-dance-festival
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart greek-dance-festival
```

### Quick Deploy Script (create on server as `deploy.sh`):
```bash
#!/bin/bash
cd /var/www/greek-dance-festival
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart greek-dance-festival
echo "✅ Deployment complete!"
```

Make it executable: `chmod +x deploy.sh`

---

## 📊 Useful Commands

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs                # View logs
pm2 restart all         # Restart all apps
pm2 stop greek-dance-festival    # Stop app
pm2 delete greek-dance-festival  # Remove from PM2
```

### Database Commands
```bash
npx prisma studio       # Visual database editor
npx prisma migrate status   # Check migration status
npx prisma db push      # Push schema changes (dev only)
```

---

## 🐛 Troubleshooting

### App won't start
- Check logs: `pm2 logs greek-dance-festival`
- Verify `.env` file exists and has correct values
- Ensure `npm run build` completed successfully

### Database errors
- Run `npx prisma generate` after deploying
- Run `npx prisma migrate deploy` for new migrations
- Check DATABASE_URL path is correct

### 502 Bad Gateway
- App might not be running: `pm2 status`
- Check if port 3000 is correct in Nginx config
- Verify firewall allows internal traffic

### Permission errors
- Ensure proper ownership: `chown -R www-data:www-data /var/www/greek-dance-festival`

---

## ✅ Deployment Checklist

- [ ] Git installed locally
- [ ] Repository created on GitHub/GitLab
- [ ] Code pushed to remote
- [ ] Server has Node.js 18+
- [ ] Repository cloned on server
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with production values
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] App built (`npm run build`)
- [ ] PM2/systemd configured
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificate installed
- [ ] Google OAuth callback URL updated for production
- [ ] Test all features work

---

## 🎉 You're Live!

Your Greek Dance Festival app should now be accessible at your domain!

For questions or issues, check the logs first:
```bash
pm2 logs greek-dance-festival --lines 100
```
