# Vercel Environment Variables Setup

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
Visit: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 2. Add These 4 Variables

For EACH variable:
- ✅ Select: **Production, Preview, and Development**
- ⚠️ Do NOT add quotes around the values
- ⚠️ Make sure there are no extra spaces

#### Variable 1: GOOGLE_CLIENT_ID
- Name: `GOOGLE_CLIENT_ID`
- Value: Copy the `client_id` from your Google OAuth JSON
  - Should look like: `XXXXXXX-XXXX.apps.googleusercontent.com`

#### Variable 2: GOOGLE_CLIENT_SECRET  
- Name: `GOOGLE_CLIENT_SECRET`
- Value: Copy the `client_secret` from your Google OAuth JSON
  - Should look like: `GOCSPX-XXXXXXXXXXXX`

#### Variable 3: NEXTAUTH_URL
- Name: `NEXTAUTH_URL`
- Value: `https://www.greekdancefestival.gr`

#### Variable 4: NEXTAUTH_SECRET
- Name: `NEXTAUTH_SECRET`
- Value: Generate a random string using PowerShell:
  ```powershell
  [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  ```
  Then paste the output

### 3. Redeploy
After adding ALL 4 variables:
1. Go to **Deployments** tab
2. Click **⋮** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for completion

### 4. Test
1. Visit: https://www.greekdancefestival.gr/api/check-env
2. Verify all values show `true`
3. Try login: https://www.greekdancefestival.gr/login
4. Click "Continue with Google"

## Troubleshooting

### Check Environment Variables Are Loaded
Visit: `https://www.greekdancefestival.gr/api/check-env`

This will show you which environment variables are properly set.

### Common Issues
- ❌ Didn't select "Production" environment when adding variables
- ❌ Added quotes around the values (don't do this!)
- ❌ Forgot to redeploy after adding variables
- ❌ Spaces before/after the values
