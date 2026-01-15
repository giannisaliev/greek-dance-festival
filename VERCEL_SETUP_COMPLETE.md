# Complete Vercel Setup Guide

## Step 1: Create PostgreSQL Database

1. Go to your Vercel Dashboard
2. Go to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name it: `greek-festival-db`
6. Click **Create**
7. Go to the database → **Settings** → **General**
8. Copy the connection strings:
   - `POSTGRES_URL` (for pooled connections)
   - `POSTGRES_URL_NON_POOLING` (for direct connections)

## Step 2: Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

### Required Variables:

1. **DATABASE_URL**
   - Value: Paste the `POSTGRES_URL` value
   - Select: Production, Preview, Development

2. **DIRECT_URL**
   - Value: Paste the `POSTGRES_URL_NON_POOLING` value
   - Select: Production, Preview, Development

3. **NEXTAUTH_URL**
   - Value: `https://www.greekdancefestival.gr`
   - Select: Production, Preview, Development

4. **NEXTAUTH_SECRET**
   - Generate using PowerShell:
   ```powershell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```
   - Select: Production, Preview, Development

5. **JWT_SECRET**
   - Generate another secret (same method as above)
   - Select: Production, Preview, Development

### Optional (if using Google OAuth):

6. **GOOGLE_CLIENT_ID**
   - Value: Your Google OAuth Client ID
   - Select: Production, Preview, Development

7. **GOOGLE_CLIENT_SECRET**
   - Value: Your Google OAuth Secret
   - Select: Production, Preview, Development

## Step 3: Deploy

1. Commit and push your changes:
```powershell
git add .
git commit -m "Configure PostgreSQL for Vercel"
git push
```

2. Vercel will automatically deploy

## Step 4: Initialize Database

After deployment completes:

1. Go to your Vercel Dashboard
2. Go to your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **...** (three dots) → **View Function Logs**
6. Or run migrations manually (see below)

### Manual Migration (if needed):

Install Vercel CLI if you haven't:
```powershell
npm i -g vercel
```

Then run:
```powershell
vercel login
vercel env pull .env.production
npx prisma migrate deploy
```

## Step 5: Create Admin User

You have two options:

### Option A: Via Signup (Recommended)
1. Go to https://www.greekdancefestival.gr/signup
2. Create an account with: `giannisaliev@gmail.com` or `themis.prodance@gmail.com`
3. These emails are automatically made admin (configured in auth-config.ts)

### Option B: Via Prisma Studio
```powershell
vercel env pull .env.production
npx prisma studio
```
Then manually set `isAdmin = true` for your user

## Step 6: Verify

1. Visit: https://www.greekdancefestival.gr
2. Login with your account
3. You should see "Admin Panel" in the user menu
4. Click it to access admin features

## File Uploads (Important!)

Currently, file uploads use local storage which **won't persist on Vercel**.

For production file uploads, you need to set up **Vercel Blob Storage**:

1. Go to Vercel Dashboard → **Storage**
2. Create **Blob** storage
3. Connect it to your project
4. Update the upload API to use Vercel Blob (I can help with this)

Alternatively, use Cloudinary (free tier available).

## Troubleshooting

### Database Connection Issues
- Make sure `DATABASE_URL` and `DIRECT_URL` are set correctly
- Check that the database is in the same region as your deployment

### Login Issues
- Verify `NEXTAUTH_URL` matches your domain exactly
- Make sure `NEXTAUTH_SECRET` is set
- Check browser console for errors

### Admin Access Issues
- Verify your email matches one in auth-config.ts
- Check Prisma Studio to confirm `isAdmin = true`

### File Upload Issues
- For now, uploads won't persist on Vercel
- Set up Vercel Blob or Cloudinary for production
