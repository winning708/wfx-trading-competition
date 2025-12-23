# Quick Start: MT4/MT5 Integration

## 5-Minute Setup

### Step 1: Get API Credentials

Choose one option:

**Option A: MetaApi (Easiest)**
1. Visit https://metaapi.cloud and sign up
2. Connect your JustMarkets MT4/MT5 account
3. Copy your Account ID from dashboard
4. Generate API token from Settings
5. Your endpoint: `https://mt4api.metaapi.cloud`

**Option B: Broker API**
1. Contact JustMarkets support
2. Request REST API access
3. Get endpoint URL and credentials

### Step 2: Link Account in Admin

1. Open Admin → Monitoring tab
2. Click "Link MT4/MT5" button
3. Fill the form:
   ```
   Trading Credential: [Select previously uploaded credential]
   MT4 Account ID: 1234567
   API Token: your_api_token_here
   Server Endpoint: https://mt4api.metaapi.cloud
   Platform: MT4 (or MT5)
   ```
4. Click "Link Account"

### Step 3: Test the Connection

1. Click the "Sync" button on your integration
2. Wait a few seconds
3. Check status - should show "Success"
4. View leaderboard - balance/profit should update

### Step 4: Enable Auto-Sync (Optional)

Edit `server/index.ts`:

```typescript
import cron from 'node-cron';

// Add this inside createServer():
cron.schedule('*/15 * * * *', () => {
  fetch('http://localhost:3000/api/sync/mt4/trigger');
});
```

Then:
```bash
pnpm add node-cron
```

## What Changed from MyFXBook

| Feature | MyFXBook | MT4/MT5 |
|---------|----------|---------|
| Setup | MyFXBook account required | Direct MT4 API access |
| Cost | Free but limited | $0-20/month (MetaApi) |
| Speed | 1-3s per sync | 0.5-2s per sync |
| Data | Equity curves, historical | Real-time balance/profit |
| Reliability | Third-party dependency | Direct connection |
| Customization | Limited | Fully customizable |

## Database Changes

New table: `mt4_integrations`
- Stores MT4 account IDs, API tokens, endpoints
- Replaces MyFXBook's integration table
- Old MyFXBook data remains in `myfxbook_integrations`

## API Endpoints

### Trigger Sync
```bash
# Sync all MT4/MT5 accounts
POST /api/sync/mt4/trigger

# Sync specific account
POST /api/sync/mt4/trigger/{integrationId}
```

## Monitoring

**Check Sync Status:**
1. Admin → Monitoring tab
2. Look at "Sync Status" column
3. View "Last Sync" timestamp
4. Check Recent Sync History section

**Error Messages:**
- Sync status will show "Error"
- Click integration to see error details
- Check browser console for logs
- Check `/server` logs for `[MT4 Sync]` messages

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No trader associated" | Assign credential to trader in Admin → Assignments |
| "Failed to fetch" | Verify API endpoint URL and token are correct |
| Sync stuck on "Syncing" | Refresh page or restart server |
| Balance not updating | Click "Sync" button manually, check sync history |
| API connection error | Test endpoint with `curl https://api-url.com/accounts/123` |

## File Reference

| File | Purpose |
|------|---------|
| `server/lib/mt4-client.ts` | Connects to MT4 API |
| `client/lib/mt4.ts` | Frontend functions (link, sync, delete) |
| `client/pages/AdminPage.tsx` | UI for linking accounts |
| `MT4_SETUP.md` | Full documentation |

## What's Next?

1. ✅ Link your first MT4 account
2. ✅ Test sync with manual button click
3. ✅ Verify balance shows on leaderboard
4. ✅ Link remaining trader accounts
5. ✅ Set up auto-sync for production
6. ✅ Monitor sync history regularly

---

Need help? See `MT4_SETUP.md` for detailed documentation.
