# MyFXBook Backend Sync Setup Guide

## Overview

The backend system automatically fetches trading data from MyFXBook and updates the leaderboard. This guide shows how to configure it.

## Prerequisites

1. MyFXBook accounts linked in the admin panel
2. Supabase service role key (for backend authentication)
3. A method to trigger syncs (manual API calls or cron job)

## Step 1: Get Supabase Service Role Key

The backend needs a special key to update the database. Here's how to get it:

1. Go to your Supabase project: https://app.supabase.com
2. Click on "Settings" in the left sidebar
3. Click on "API" 
4. Look for "service_role" key (under "Project API Keys")
5. Copy the key (it starts with `eyJ...`)

**Important:** Keep this key secret! Never commit it to version control.

## Step 2: Set Environment Variable

Set the following environment variable on your server:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

If using fly.io:
```bash
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

If using a local `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

## Step 3: API Endpoints

### Manual Sync (One-Time)

**Sync all integrations:**
```bash
curl -X POST http://localhost:3000/api/sync/trigger
```

**Sync specific integration:**
```bash
curl -X POST http://localhost:3000/api/sync/trigger/{integrationId}
```

**Check sync status:**
```bash
curl -X GET http://localhost:3000/api/sync/status
```

### Response Examples

**Success:**
```json
{
  "success": true,
  "message": "Sync complete: 2 success, 0 failed",
  "synced": 2,
  "failed": 0
}
```

**Error:**
```json
{
  "success": false,
  "message": "Sync failed: SUPABASE_SERVICE_ROLE_KEY not set"
}
```

## Step 4: Automated Sync (Optional)

### Option A: Using Cron Job (Linux/Mac)

Create a cron job to sync every 15 minutes:

1. Edit crontab:
```bash
crontab -e
```

2. Add this line (syncs every 15 minutes):
```cron
*/15 * * * * curl -X POST http://your-server:3000/api/sync/trigger >> /var/log/myfxbook-sync.log 2>&1
```

For a cloud server, you might need to adjust the URL:
```cron
*/15 * * * * curl -X POST https://your-domain.com/api/sync/trigger >> /var/log/myfxbook-sync.log 2>&1
```

### Option B: Using Node-cron (Built-in)

You can modify `server/index.ts` to add scheduled sync:

```typescript
import cron from 'node-cron';
import { handleSyncAll } from './routes/sync';

// Schedule sync every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('[Cron] Running scheduled MyFXBook sync...');
  // Call the sync function directly
});
```

**Install node-cron:**
```bash
pnpm add node-cron
```

### Option C: Using External Service

Use a service like:
- **Uptime Robot** - Free monitoring service with webhook support
- **AWS Lambda** - Serverless functions
- **GitHub Actions** - Free CI/CD workflow
- **Railway/Render** - Cloud platform with built-in cron

## Step 5: Monitoring

### Check Sync Logs

The backend logs sync attempts with:
- Integration ID
- Trader name
- Balance and profit data
- Success/failure status

Look for logs starting with `[Sync]` or `[MyFXBook]`.

### View Sync History in Admin Panel

Go to Admin → Monitoring → Recent Sync History to see:
- Type (automatic/manual)
- Status (success/error)
- Records updated
- Timestamp

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:** Set the environment variable (see Step 2)

### "Failed to fetch account data from MyFXBook"

**Possible causes:**
1. Incorrect MyFXBook Account ID
2. Incorrect MyFXBook API Password
3. MyFXBook API is down
4. Account is deactivated on MyFXBook

**Solution:**
- Verify credentials in Admin → Monitoring
- Test account login on MyFXBook directly
- Check MyFXBook status page

### "No trader associated with this credential"

**Cause:** Credential hasn't been assigned to a trader yet

**Solution:**
- Go to Admin → Credentials
- Upload the credential (auto-assigns to first unassigned trader)
- Or manually assign in Admin → Assignments

### Sync Not Running

If automatic sync isn't working:

1. Check if cron job is active:
```bash
crontab -l
```

2. Check cron logs:
```bash
# macOS
log stream --predicate 'eventMessage contains[cd] "cron"' --info

# Linux
grep CRON /var/log/syslog
```

3. Manually test the API:
```bash
curl -X POST http://localhost:3000/api/sync/trigger -v
```

## Data Flow

```
MyFXBook Account
       ↓
fetchMyFXBookAccountData() [myfxbook-client.ts]
       ↓
syncMyFXBookAccount() returns {balance, profit%}
       ↓
updatePerformanceData() [supabase-client.ts]
       ↓
Supabase performance_data table
       ↓
Leaderboard auto-updates
```

## API Response Times

- MyFXBook API fetch: ~500ms - 2s
- Database update: ~100-200ms
- Total per integration: ~1-3 seconds
- Full sync (5 integrations): ~5-15 seconds

## Next Steps

1. ✅ Set SUPABASE_SERVICE_ROLE_KEY
2. ✅ Link MyFXBook accounts in admin panel
3. ✅ Test manual sync: `curl -X POST http://localhost:3000/api/sync/trigger`
4. ✅ Set up automated cron job
5. ✅ Monitor sync history in Admin → Monitoring

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend logs for `[Sync]` and `[MyFXBook]` messages
3. Verify environment variables are set
4. Test MyFXBook credentials manually
