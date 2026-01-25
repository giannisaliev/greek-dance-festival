# Fix Vercel DATABASE_URL to Enable Teacher Ordering

## The Problem
Your Vercel DATABASE_URL is currently set to SQLite format (`file:./dev.db`), which prevents database migrations from running. This is why the teacher ordering feature keeps failing.

## Solution: Update Vercel Environment Variables

### Step 1: Get Your PostgreSQL Database URL
Your production database should already be connected to Vercel. You need to find the connection string.

1. Go to https://vercel.com/dashboard
2. Select your project: **greek-dance-festival**
3. Go to **Settings** → **Environment Variables**
4. Look for `DATABASE_URL` - it's currently incorrectly set

### Step 2: Find Your Correct PostgreSQL URL
You have two options:

**Option A: If you're using Vercel Postgres:**
1. In your Vercel project, go to **Storage** tab
2. Click on your Postgres database
3. Go to **.env.local** tab
4. Copy the `POSTGRES_PRISMA_URL` value - this is your correct DATABASE_URL
5. Also copy the `POSTGRES_URL_NON_POOLING` value - this is your DIRECT_URL

**Option B: If you're using external Postgres (like Supabase, Railway, etc.):**
1. Log into your database provider
2. Find your connection string - it should look like:
   ```
   postgresql://username:password@host:port/database?schema=public
   ```

### Step 3: Update Vercel Environment Variables
1. Back in Vercel → Settings → Environment Variables
2. Find `DATABASE_URL` and click **Edit**
3. Replace the current value (which is probably `file:./dev.db`) with your PostgreSQL URL
4. Make sure it's set for **Production**, **Preview**, and **Development** environments
5. Click **Save**

6. Add/Update `DIRECT_URL`:
   - Click **Add New**
   - Name: `DIRECT_URL`
   - Value: Your non-pooling PostgreSQL URL (same as DATABASE_URL if not using connection pooling)
   - Environments: Production, Preview, Development
   - Click **Save**

### Step 4: Redeploy
After updating the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click the **⋯** menu (three dots)
4. Select **Redeploy**
5. Check **Use existing Build Cache** (optional)
6. Click **Redeploy**

### Step 5: Verify Migration Runs
1. Once the deployment completes, click on it
2. Go to the **Logs** tab
3. Look for migration output - you should see:
   ```
   Applying migration `20260125000000_add_teacher_order`
   ```
4. If you see errors, check that your DATABASE_URL format is correct

## What Happens Next
Once the migration runs successfully:
- The `order` field will be added to the Teacher table in production
- I can re-add the order functionality to the code
- You'll be able to set display order for teachers
- Teachers will sort by order (ascending), then name (ascending)

## Common PostgreSQL URL Formats
```
# Vercel Postgres (pooled)
postgresql://username:password@host-pooler.region.postgres.vercel.com:5432/verceldb

# Vercel Postgres (direct)
postgresql://username:password@host.region.postgres.vercel.com:5432/verceldb

# Supabase
postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Railway
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

## Need Help?
If you're not sure which database you're using or can't find the URL:
1. Check your Vercel project's **Storage** tab
2. Or let me know which database service you're using (Vercel Postgres, Supabase, Railway, etc.)
