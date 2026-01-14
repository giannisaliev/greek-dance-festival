# Admin Access Setup

Your admin panel is now protected! Here's what's been implemented:

## What Changed

1. **Admin Page is Protected** - Only authenticated admin users can access `/admin`
2. **Admin Link Removed** - The Admin link is no longer visible in the public navigation
3. **Google OAuth Admin** - Your email (giannisaliev@gmail.com) is automatically set as admin when you sign in with Google

## How to Access the Admin Panel

### Step 1: Sign In with Google
1. Go to https://your-site.vercel.app/login
2. Click "Sign in with Google"
3. Use your giannisaliev@gmail.com account

### Step 2: Access Admin Panel
Once signed in with your Google account, you can access the admin panel directly:
- https://your-site.vercel.app/admin

## What Happens to Non-Admin Users

- If someone tries to access `/admin` without being logged in → Redirected to `/login`
- If someone logs in but is NOT admin → Redirected to homepage `/`
- Only giannisaliev@gmail.com has admin access

## Database Migration

The database has been updated with:
- New `isAdmin` field on User table
- Automatic migration will run on Vercel deployment
- Your email is set as admin in the Google OAuth profile callback

## Technical Details

**Files Changed:**
- `prisma/schema.prisma` - Added `isAdmin` field to User model
- `lib/auth-config.ts` - Added admin detection for giannisaliev@gmail.com
- `app/admin/page.tsx` - Added authentication check
- `app/components/Navigation.tsx` - Removed Admin link from public menu
- `prisma/migrations/20260114000000_add_admin_field/` - Database migration

**Security Features:**
- Session-based authentication with NextAuth
- Server-side auth checks
- Automatic redirect for unauthorized access
- Admin status stored in JWT token
