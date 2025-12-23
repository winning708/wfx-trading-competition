# MyFXBook Backend Sync - Quick Start

## What's Been Built

✅ **MyFXBook API Client** - Fetches real-time trading data  
✅ **Backend Sync Routes** - API endpoints to trigger syncs  
✅ **Database Integration** - Updates leaderboard with real data  
✅ **Error Logging** - Tracks sync history and failures  

## System Components

### Frontend (Client)
- **Admin Panel → Monitoring Tab**: Link credentials to MyFXBook accounts, view sync status
- **Auto-assignment**: Credentials automatically assigned to traders when uploaded

### Backend (Server)
- **`server/lib/myfxbook-client.ts`**: Fetches data from MyFXBook API
- **`server/lib/supabase-client.ts`**: Updates Supabase database
- **`server/routes/sync.ts`**: Handles sync API endpoints

### Database
- **`myfxbook_integrations`**: Links credentials to MyFXBook accounts
- **`sync_history`**: Logs all sync attempts
- **`performance_data`**: Updated with real balances and profit %

## Quick Setup (5 Minutes)

### Step 1: Get Your Service Role Key

1. Visit https://app.supabase.com
2. Go to your project: **WFX SHOWDOWN**
3. Click **Settings** → **API**
4. Copy the **service_role** key (the long string starting with `eyJ...`)

### Step 2: Set Environment Variable

Run this command (replace with your actual key):

```bash
# For local development
export SUPABASE_SERVICE_ROLE_KEY=your_key_here

# For fly.io production
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here

# Or add to .env file
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env
```

### Step 3: Test the Sync Manually

Open a terminal and run:

```bash
# Sync all MyFXBook integrations
curl -X POST http://localhost:3000/api/sync/trigger

# Check sync status
curl -X GET http://localhost:3000/api/sync/status
```

Expected response:
```json
{
  "success": true,
  "message": "Sync complete: X success, Y failed",
  "synced": X,
  "failed": Y
}
```

### Step 4: (Optional) Set Up Automatic Syncing

**For every 15 minutes:**

```bash
# Edit crontab
crontab -e

# Add this line:
*/15 * * * * curl -X POST http://localhost:3000/api/sync/trigger >> /var/log/myfxbook-sync.log 2>&1
```

## How It Works

```
┌─────────────────────────────────────────┐
│ 1. Trader Registers & Pays $15          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ 2. Admin Uploads Trading Credential     │
│    (JustMarkets account)                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ 3. Admin Links to MyFXBook              │
│    (Account ID + API Password)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ 4. System Syncs Data (Auto or Manual)   │
│    - Fetches data from MyFXBook         │
│    - Updates performance_data table     │
│    - Leaderboard auto-updates           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ 5. Leaderboard Shows Live Rankings      │
│    with Real Trading Performance        │
└─────────────────────────────────────────┘
```

## API Endpoints

### POST /api/sync/trigger
**Sync all MyFXBook integrations**

```bash
curl -X POST http://localhost:3000/api/sync/trigger
```

**Response:**
```json
{
  "success": true,
  "message": "Sync complete: 3 success, 0 failed",
  "synced": 3,
  "failed": 0
}
```

### POST /api/sync/trigger/:integrationId
**Sync a specific integration**

```bash
curl -X POST http://localhost:3000/api/sync/trigger/550e8400-e29b-41d4-a716-446655440000
```

### GET /api/sync/status
**Check sync status of all integrations**

```bash
curl -X GET http://localhost:3000/api/sync/status
```

**Response:**
```json
{
  "success": true,
  "integrations": [
    {
      "id": "...",
      "myfxbook_account_id": "123456",
      "sync_status": "success",
      "last_sync": "2025-12-23T10:30:00Z"
    }
  ],
  "total": 1
}
```

## Monitoring in Admin Panel

1. Go to **Admin → Monitoring**
2. View all linked MyFXBook accounts
3. Click **Sync** to manually trigger update for one account
4. Click **Sync All** to update all accounts
5. View sync history with timestamps and status

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:** Set the environment variable (see Step 2)

### MyFXBook Fetch Error

**Cause:** Wrong credentials  
**Solution:** 
- Go to Admin → Monitoring
- Delete the integration
- Re-link with correct MyFXBook Account ID and API Password

### Leaderboard Not Updating

**Check:**
1. Is MyFXBook account linked? (Admin → Monitoring)
2. Did sync succeed? (Check sync status)
3. Are traders assigned? (Admin → Assignments)

**Solution:**
- Try manual sync: `curl -X POST http://localhost:3000/api/sync/trigger`
- Check logs for `[Sync]` messages

## Next Steps

1. ✅ Set SUPABASE_SERVICE_ROLE_KEY
2. ✅ Test sync manually
3. ✅ Link MyFXBook accounts in Admin → Monitoring
4. ✅ Set up cron job for automatic syncing (optional)
5. ✅ Monitor sync history in Admin → Monitoring

## Data Sync Frequency

By default (if you set up cron):
- **Every 15 minutes**: Leaderboard updates with real trading data
- **Manual**: Click "Sync" in Admin panel anytime

## Security Notes

- ✅ Service role key is **never exposed** to frontend
- ✅ MyFXBook passwords are stored securely in Supabase
- ✅ All syncs are logged with timestamps
- ✅ Errors are recorded for debugging

## Support

See `MYFXBOOK_SETUP.md` for detailed documentation and troubleshooting.
