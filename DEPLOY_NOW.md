# 🚀 QUICK DEPLOYMENT GUIDE

## 📋 What You Need to Do Externally

### 1. On Your Server (via SSH or hosting terminal):

```bash
# Clone the repository
git clone https://github.com/giannisaliev/greek-dance-festival.git
cd greek-dance-festival

# Create and configure .env file
cp .env.production .env
nano .env  # Edit with your actual values

# Make deploy script executable
chmod +x deploy.sh update.sh

# Run deployment
./deploy.sh
```

### 2. Generate Secure Secrets

On your server, run these commands to generate secure keys:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Copy these outputs into your `.env` file.

### 3. Update .env File on Server

Edit the `.env` file and replace these values:
- `NEXTAUTH_URL` → Your domain (e.g., https://greekdance.com)
- `JWT_SECRET` → Output from first openssl command
- `NEXTAUTH_SECRET` → Output from second openssl command
- `EMAIL_USER` → Your email address
- `EMAIL_PASSWORD` → Your email app password
- `ADMIN_EMAIL` → Admin email address

### 4. (Optional) If Using Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Update the authorized redirect URI to: `https://yourdomain.com/api/auth/callback/google`
3. Add your Google credentials to `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 5. (Optional) Set Up Nginx Reverse Proxy

If using Nginx, create: `/etc/nginx/sites-available/greek-dance-festival`

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

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/greek-dance-festival /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. (Optional) Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Verify Deployment

Check if the app is running:
```bash
pm2 status
pm2 logs greek-dance-festival
```

Visit your domain in a browser to test!

---

## 🔄 Future Updates

When you make changes locally:
```bash
git add .
git commit -m "Your changes"
git push
```

On your server:
```bash
cd greek-dance-festival
./update.sh
```

---

## 📞 Useful Commands

```bash
pm2 status                      # Check app status
pm2 logs greek-dance-festival   # View logs
pm2 restart greek-dance-festival # Restart app
pm2 stop greek-dance-festival    # Stop app
npx prisma studio               # Open database GUI
```
