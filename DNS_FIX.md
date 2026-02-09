# DNS Troubleshooting - Greek Dance Festival

## Current Issue
App stopped working after nameserver changes. DNS propagation in progress.

## What You Need

Your domain `greekdancefestival.gr` must point to Vercel with these DNS records:

### For Vercel (Required DNS Records)

**Option 1: Using CNAME (Recommended for www)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Option 2: Using A Records (For root domain @)**
```
Type: A
Name: @ (or root/blank)
Value: 76.76.21.21
TTL: 3600
```

**Additional A Record**
```
Type: A  
Name: @ (or root/blank)
Value: 76.76.21.93
TTL: 3600
```

**AAAA Records (IPv6 - Optional but recommended)**
```
Type: AAAA
Name: @ (or root/blank)
Value: 2606:4700:10::ac43:1515
TTL: 3600

Type: AAAA
Name: @ (or root/blank)  
Value: 2606:4700:10::ac43:155d
TTL: 3600
```

## Step-by-Step Fix

### Step 1: Check Current Nameservers

Open PowerShell and run:
```powershell
nslookup -type=NS greekdancefestival.gr
```

Confirm you're back on: `ns329.grserver.gr` and `ns330.grserver.gr`

### Step 2: Verify DNS Records at Your Registrar

Log into your domain registrar (where you bought greekdancefestival.gr):

1. Go to DNS Settings / DNS Management
2. Confirm nameservers are: `ns329.grserver.gr` and `ns330.grserver.gr`
3. Check if these DNS records exist:
   - CNAME record for `www` pointing to `cname.vercel-dns.com`
   - A records for `@` pointing to `76.76.21.21` and `76.76.21.93`

4. **If missing**, add them now (see records above)

### Step 3: Check DNS Propagation

Use online tools to check propagation:
```
https://www.whatsmydns.net/#A/greekdancefestival.gr
https://www.whatsmydns.net/#CNAME/www.greekdancefestival.gr
```

This will show if DNS has propagated globally.

### Step 4: Check Vercel Domain Status

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Go to your project
3. Click **Settings** → **Domains**
4. Check the status of `www.greekdancefestival.gr`
   - ✅ Green check = Working
   - ⚠️ Yellow warning = Propagating (wait 24-48 hours)
   - ❌ Red error = DNS records incorrect

5. If showing error, click **Refresh** or **Re-verify**

### Step 5: Clear Your Local DNS Cache

#### Windows:
```powershell
ipconfig /flushdns
```

#### Chrome Browser Cache:
1. Open Chrome
2. Go to: `chrome://net-internals/#dns`
3. Click **Clear host cache**

#### Try Incognito/Private Mode:
This bypasses some caching.

### Step 6: Wait for Propagation

DNS changes can take:
- **1-4 hours**: Most locations
- **24-48 hours**: Complete global propagation

During this time:
- Some users may see the site, others won't
- It may work intermittently
- SSL certificate errors are normal during propagation

## Testing While Waiting

You can test your Vercel deployment directly:

1. Go to Vercel Dashboard
2. Copy your **Vercel project URL** (looks like: `your-project.vercel.app`)
3. Visit that URL directly
4. If it works there but not on your domain → DNS issue (keep waiting)
5. If it doesn't work anywhere → deployment issue (check logs)

## Common Issues

### "Site Can't Be Reached" / "DNS_PROBE_FINISHED_NXDOMAIN"
- **Cause**: DNS not propagated yet or wrong records
- **Fix**: Wait 24-48 hours, verify DNS records are correct

### "Your Connection is Not Private" (SSL Error)
- **Cause**: SSL certificate being renewed by Vercel
- **Fix**: Wait 1-4 hours, Vercel auto-renews certificates

### Works on Mobile Data but Not WiFi
- **Cause**: Your ISP/router cached old DNS
- **Fix**: Restart router, wait a few hours, or use mobile data temporarily

### Works in One Country/Location but Not Another
- **Cause**: DNS propagation in progress
- **Fix**: Wait 24-48 hours for global propagation

## Emergency Workaround

While waiting for DNS, you can:

1. Access via Vercel URL: `your-project.vercel.app`
2. Share that URL with anyone who needs immediate access
3. Once DNS propagates, the custom domain will work

## Need Help?

Contact your domain registrar (where you manage greekdancefestival.gr) and ask:
- "Can you verify my DNS records are propagating correctly?"
- "Can you see the A and CNAME records for Vercel?"
- Show them the DNS records from this document

## Check Everything is Working

Once DNS propagates (24-48 hours), verify:

```powershell
# Check DNS resolution
nslookup www.greekdancefestival.gr

# Should show Vercel IPs: 76.76.21.21 or 76.76.21.93
```

Visit:
- https://www.greekdancefestival.gr (should load)
- https://greekdancefestival.gr (should redirect to www)

## Summary

**Your app is fine** - this is purely a DNS issue. The nameserver change disrupted DNS records, and now you need to:

1. ✅ Confirm nameservers are back to: ns329/ns330.grserver.gr
2. ✅ Verify DNS records point to Vercel (add if missing)
3. ⏰ Wait 24-48 hours for DNS propagation
4. 🧹 Clear your local DNS cache
5. ✅ Check Vercel domain status in dashboard

**Most importantly**: Be patient. DNS propagation is slow by design for internet stability.
