# Email Configuration Verification

## Current Status
Your local `.env.local` has the correct email configuration:
- EMAIL_USER=greekdancefestival@gmail.com
- EMAIL_HOST=smtp.gmail.com
- EMAIL_PORT=587
- ADMIN_EMAIL=greekdancefestival@gmail.com

## ⚠️ CRITICAL: Vercel Environment Variables

**The emails won't work in production until you add these to Vercel!**

### Steps to Add Environment Variables to Vercel:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/giannis-projects-18fc9db3/greek-dance-festival

2. **Navigate to Settings:**
   - Click on your project "greek-dance-festival"
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add These Variables (one at a time):**

   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=greekdancefestival@gmail.com
   EMAIL_PASSWORD=mwwtesirevezavtz
   ADMIN_EMAIL=greekdancefestival@gmail.com
   ```

4. **For each variable:**
   - Name: `EMAIL_HOST`
   - Value: `smtp.gmail.com`
   - Environments: Check all three boxes (Production, Preview, Development)
   - Click "Save"

5. **Redeploy After Adding Variables:**
   - After adding all 5 email variables, go to "Deployments" tab
   - Click the three dots (...) next to the latest deployment
   - Click "Redeploy"
   - Wait for the deployment to complete

## Gmail App Password Note

The password `mwwtesirevezavtz` is a Gmail App Password. Make sure:
- 2-Factor Authentication is enabled on greekdancefestival@gmail.com
- This App Password is still valid
- If not working, generate a new one at: https://myaccount.google.com/apppasswords

## Testing

After setting up Vercel environment variables and redeploying:
1. Submit a test hotel booking at: https://www.greekdancefestival.gr/hotel
2. Check the customer email for confirmation
3. Check greekdancefestival@gmail.com for admin notification

## Troubleshooting

If emails still don't arrive after setup:
1. Check Vercel deployment logs for email errors
2. Verify the Gmail App Password hasn't expired
3. Check spam folders
4. Verify EMAIL_USER and ADMIN_EMAIL are correctly set in Vercel
