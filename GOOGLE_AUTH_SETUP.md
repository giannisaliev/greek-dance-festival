# Google OAuth Authentication Setup Guide

## ✅ Implementation Complete!

Your Greek Dance Festival app now supports **Google Sign-In** for both login and registration!

## 🔧 Setup Required: Google OAuth Credentials

To enable Google authentication, you need to create OAuth credentials from Google Cloud Console.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Greek Dance Festival" (or any name you prefer)
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (for testing with any Google account)
   - Fill in:
     - App name: "Greek Dance Festival"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add test users if needed (click "Save and Continue")
   - Click "Back to Dashboard"

4. Now create the OAuth Client ID:
   - Application type: **Web application**
   - Name: "Greek Dance Festival Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

5. **Copy the credentials:**
   - Client ID (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abcdefg123456`)

### Step 4: Update Your .env File

Open your `.env` file and replace the placeholder values:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

Also update the NEXTAUTH_SECRET:

```env
NEXTAUTH_SECRET=your-random-secret-here
```

To generate a random secret, you can run this in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 5: Restart Your Development Server

After updating the `.env` file:

1. Stop the server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. Go to http://localhost:3000/login or http://localhost:3000/signup

## 🎯 Features Implemented

### Login Page (`/login`)
- ✅ Email/Password login (existing users)
- ✅ **NEW:** "Continue with Google" button
- ✅ Beautiful Google logo with proper branding
- ✅ OR divider between methods

### Signup Page (`/signup`)
- ✅ Email/Password signup (creates account)
- ✅ **NEW:** "Continue with Google" button
- ✅ Instant account creation with Google
- ✅ No password needed for Google users

### How It Works

#### For Email/Password Users (Unchanged):
1. User signs up with email/password
2. Password is hashed and stored
3. User logs in with credentials

#### For Google Users (NEW):
1. User clicks "Continue with Google"
2. Redirected to Google sign-in
3. User approves permissions
4. Account automatically created (if new)
5. User is logged in and redirected to dashboard

## 🔐 Security Features

- **OAuth 2.0**: Industry-standard authentication
- **No password storage**: Google users don't have passwords in your database
- **Secure tokens**: JWT-based session management
- **Account linking**: Existing email users can link Google later (optional future feature)

## 📊 Database Changes

New tables added to support NextAuth:

```prisma
model Account {
  // Stores OAuth provider information
  id, userId, provider, providerAccountId
  refresh_token, access_token, expires_at
}

model Session {
  // Manages user sessions
  sessionToken, userId, expires
}

model VerificationToken {
  // Email verification tokens
  identifier, token, expires
}
```

The `User` model was updated:
- `password` is now **optional** (for Google users)
- Added `emailVerified`, `image` fields

## 🧪 Testing

### Test Email/Password Flow:
1. Go to `/signup`
2. Create account with email/password
3. Login at `/login`
4. Should work as before

### Test Google Sign-In:
1. Make sure you've added Google OAuth credentials to `.env`
2. Go to `/signup` or `/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. Should be redirected to `/register` or `/dashboard`

## 🚀 For Production

When deploying to production:

1. **Update Google OAuth settings:**
   - Add production domain to Authorized JavaScript origins:
     - `https://yourdomain.com`
   - Add production callback to Authorized redirect URIs:
     - `https://yourdomain.com/api/auth/callback/google`

2. **Update environment variables:**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=<strong-random-secret>
   ```

3. **Verify OAuth consent screen:**
   - Submit app for verification if needed
   - Update branding, privacy policy, terms of service

## 🎨 UI/UX

The Google sign-in button features:
- ✅ Official Google colors (Blue, Green, Yellow, Red)
- ✅ Google logo SVG
- ✅ "Continue with Google" text (recommended by Google)
- ✅ Consistent styling with your app theme
- ✅ Hover effects
- ✅ Clear visual separation from email/password form

## ⚠️ Important Notes

1. **Testing:** You can test Google OAuth on `localhost:3000` without publishing your app
2. **Test Users:** In Google Cloud Console, add test users if your app is in testing mode
3. **Scopes:** The app only requests basic profile info (email, name, profile picture)
4. **Privacy:** No password is ever sent to or stored by your app for Google users

## 📝 Next Steps (Optional Enhancements)

- Add profile picture display from Google
- Allow users to link multiple auth methods
- Add "Sign out from all devices" feature
- Implement account deletion
- Add social profile information to user dashboard

---

**Your app is now ready with Google Authentication! 🎉**

Just add your Google OAuth credentials to `.env` and restart the server.
