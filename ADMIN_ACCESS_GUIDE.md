# Admin Panel Access Guide

## Overview

The admin panel is now **password-protected** to prevent unauthorized access. When the site goes live, you'll need to set a secure admin password in your hosting environment.

## Local Development

### Testing Admin Login Locally

**Temporary Password (for testing):** `TempAdmin123!`

1. Navigate to: `http://localhost:8080/admin-login`
2. Enter the password: `TempAdmin123!`
3. Click **Access Panel**
4. You'll be redirected to the admin dashboard at `/admin`

## Production Deployment

### Setting Up Admin Access on Netlify

1. **Go to your Netlify site dashboard**
   - Navigate to: https://app.netlify.com
   - Select your project

2. **Add environment variable**
   - Click: **Site settings** → **Build & deploy** → **Environment**
   - Click: **Edit variables** button
   - Add new variable:
     - **Key:** `ADMIN_PASSWORD`
     - **Value:** (Your secure password - min 12 characters recommended)
   - Click: **Save**

3. **Trigger a new deploy**
   - Go to: **Deploys** tab
   - Click: **Trigger deploy** → **Deploy site**
   - Wait for deployment to complete

4. **Access admin panel**
   - Visit: `https://yourdomain.com/admin-login`
   - Enter your admin password
   - You're now logged in

### Setting Up Admin Access on Vercel

1. **Go to your Vercel dashboard**
   - Navigate to: https://vercel.com/dashboard

2. **Add environment variable**
   - Click: Your project name
   - Go to: **Settings** → **Environment Variables**
   - Click: **Add new variable**
   - Add:
     - **Name:** `ADMIN_PASSWORD`
     - **Value:** (Your secure password - min 12 characters recommended)
     - **Environment:** Select all (Production, Preview, Development)
   - Click: **Save**

3. **Redeploy**
   - Go to: **Deployments** tab
   - Click: **Redeploy** on the latest deployment
   - Wait for completion

4. **Access admin panel**
   - Visit: `https://yourdomain.com/admin-login`
   - Enter your admin password
   - You're now logged in

### Setting Up Admin Access on Other Platforms

**AWS Amplify:**
1. Go to **App settings** → **Environment variables**
2. Add `ADMIN_PASSWORD` variable
3. Redeploy the app

**Heroku:**
1. Go to **Settings** → **Config Vars**
2. Add `ADMIN_PASSWORD` variable
3. Redeploy: `git push heroku main`

**Firebase Hosting:**
1. Set in `.env.production` or via CLI
2. Rebuild and redeploy

**Generic (Docker/VPS):**
1. Set `ADMIN_PASSWORD` in your `.env` file
2. Restart your application

## Security Best Practices

### Password Requirements

✅ **Use a strong password:**
- **Minimum 12 characters**
- **Mix of:** uppercase, lowercase, numbers, and symbols
- **Example:** `Secure#Admin2024Pass!`

❌ **Avoid:**
- Common words or patterns
- Your name or site name
- Sequential numbers
- Dictionary words

### Protecting Your Password

1. **Never commit to git:**
   - Don't add `ADMIN_PASSWORD` to `.env` file in version control
   - Use only environment variables in your hosting platform

2. **Change periodically:**
   - Update password every 3-6 months
   - Change immediately if compromised

3. **Use HTTPS only:**
   - Ensure your site always uses `https://`
   - Never access `/admin-login` over `http://`

4. **Limit access:**
   - Don't share your password
   - Log out after use: go to `/admin-login` and clear localStorage

## How Admin Authentication Works

### Login Flow

```
User enters password at /admin-login
         ↓
Backend verifies against ADMIN_PASSWORD
         ↓
If correct: Generate token, store in localStorage
         ↓
Redirect to /admin
         ↓
Route checks localStorage for admin_token
         ↓
Token present → Show admin panel
```

### Session Management

- **Session stored in:** Browser's localStorage
- **Session key:** `admin_token` and `admin_authenticated`
- **Persistence:** Until browser is closed or localStorage cleared
- **Timeout:** No automatic timeout (stay logged in until manual logout)

### Logout

To logout:
1. Clear browser data/localStorage
2. Or manually in browser console:
```javascript
localStorage.removeItem("admin_token");
localStorage.removeItem("admin_authenticated");
window.location.href = "/admin-login";
```

## Troubleshooting

### "Admin authentication is not configured"

**Problem:** `ADMIN_PASSWORD` environment variable not set

**Solution:**
1. Go to your hosting platform dashboard
2. Add `ADMIN_PASSWORD` to environment variables
3. Redeploy your site
4. Wait for deployment to complete (5-10 minutes)

### "Incorrect admin password"

**Problem:** Wrong password entered

**Solution:**
1. Double-check the password you set
2. Ensure no extra spaces before/after
3. Check Caps Lock is off (passwords are case-sensitive)
4. If forgotten, reset in hosting platform environment variables and redeploy

### Can't access `/admin-login`

**Problem:** Page returns 404 or isn't loading

**Solution:**
1. Ensure site is fully deployed
2. Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
3. Try incognito/private window
4. Check internet connection

### Admin panel redirects to login

**Problem:** Logged in but keeps going back to `/admin-login`

**Solution:**
1. Check browser console (F12) for errors
2. Verify `admin_token` is in localStorage
3. Clear localStorage and log in again
4. Disable browser extensions that might interfere

## Advanced Security (Optional)

### For Maximum Security:

Consider implementing these additional measures:

1. **JWT Token Authentication**
   - Replace simple token with JWT
   - Add token expiration (30 min recommended)
   - Implement refresh tokens

2. **IP Whitelisting**
   - Restrict admin access to specific IP addresses
   - Requires proxy or WAF configuration

3. **OAuth/SSO Integration**
   - Use Google Sign-In, GitHub, or similar
   - Add multi-factor authentication (MFA)

4. **API Key for Webhooks**
   - Separate API key for backend operations
   - Different from admin password

## API Endpoints for Admin

All admin API endpoints require valid deployment configuration:

```
POST /api/admin/verify-password
GET /api/admin/payments/pending
POST /api/admin/payments/:traderId/approve
POST /api/admin/payments/:traderId/reject
GET /api/admin/password-reset-requests
POST /api/admin/password-reset-requests/:requestId/resolve
GET /api/admin/traders-with-passwords
// ... more endpoints
```

**Authentication:** Currently password-based via frontend localStorage  
**Note:** For production APIs, consider adding server-side token validation

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review dev server logs
3. Check browser console (F12) for errors
4. Verify environment variables are set correctly
5. Ensure site is fully deployed

---

**Last Updated:** 2024  
**Admin Panel Version:** 1.0  
**Security Level:** Basic (add JWT/OAuth for production)
