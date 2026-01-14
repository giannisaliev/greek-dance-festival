# Fix Google OAuth Login

## The Problem
The "Continue with Google" button shows an error because Google OAuth credentials are not configured in Vercel.

## Solution: Add Google OAuth to Vercel

### Step 1: Get Your Google OAuth Credentials

You already have these set up from before. Check your Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. You should see:
   - **Client ID**: Something like `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: A secret string

### Step 2: Add to Vercel Environment Variables

1. Go to https://vercel.com/giannisaliev/greek-dance-festival/settings/environment-variables
2. Add these 3 environment variables:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID from Google Console |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret from Google Console |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |

### Step 3: Update Google OAuth Settings

In Google Cloud Console, make sure your Authorized redirect URIs include:
- `https://www.greekdancefestival.gr/api/auth/callback/google`

### Step 4: Redeploy

After adding the environment variables in Vercel:
1. Go to your Vercel project
2. Click "Deployments"
3. Click the three dots on the latest deployment
4. Click "Redeploy"

## Quick Fix Alternative

If you just want admin access without Google OAuth for now:

1. You can create a password-based admin account:
   - Use the regular email/password login form
   - Contact me if you need help creating an admin account with credentials

## Testing After Setup

1. Go to https://www.greekdancefestival.gr/login
2. Click "Continue with Google"
3. Sign in with giannisaliev@gmail.com
4. You'll be automatically set as admin and redirected to /admin

## Need Help?

If you're having trouble:
1. Check Vercel logs: https://vercel.com/giannisaliev/greek-dance-festival/logs
2. Verify environment variables are set correctly
3. Make sure Google OAuth redirect URIs match your domain
