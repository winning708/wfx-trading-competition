# MT4/MT5 REST API Integration Guide

## Overview

The MT4/MT5 REST API integration allows you to automatically sync trading account data from MetaTrader platforms to the WFX Trading Competition leaderboard. This replaces the previous MyFXBook integration and provides direct access to real-time account performance metrics.

## Architecture

```
MT4/MT5 Account
       ↓
fetchMT4AccountData() [server/lib/mt4-client.ts]
       ↓
syncMT4Account() returns {balance, profit%}
       ↓
updatePerformanceData() [supabase-client.ts]
       ↓
Supabase performance_data table
       ↓
Leaderboard auto-updates
```

## Prerequisites

1. **Trading Account**: MT4 or MT5 account with JustMarkets or another broker
2. **API Access**: One of:
   - Broker's native REST API endpoint
   - MetaApi (metaapi.cloud) - professional MT4/MT5 REST API service
   - Custom MT4/MT5 WebSocket-to-REST bridge
3. **API Credentials**:
   - Account ID (trading account number)
   - API Token or Password
   - Server Endpoint URL

## Getting API Credentials

### Option 1: Using MetaApi (Recommended)

MetaApi provides a professional REST API for MT4/MT5 accounts:

1. Go to https://metaapi.cloud
2. Sign up or log in
3. Connect your JustMarkets MT4/MT5 account
4. Get your Account ID from MetaApi dashboard
5. Generate an API token from Settings → API Tokens
6. Your server endpoint will be: `https://mt4api.metaapi.cloud` (or the MetaApi endpoint they provide)

### Option 2: Broker's Native API

Contact JustMarkets support to:
1. Enable REST API access on your account
2. Get the API endpoint URL
3. Request API credentials (account ID and password)

### Option 3: Custom Bridge

If using a custom MT4 REST bridge:
1. Deploy your bridge and get the endpoint URL
2. Generate API credentials through your bridge's admin panel

## Linking an Account in Admin Panel

1. Go to Admin → Monitoring tab
2. Click "Link MT4/MT5" button
3. Fill in the form:
   - **Select Trading Credential**: Choose the credential previously uploaded
   - **MT4 Account ID**: Your trading account number (e.g., 1234567)
   - **API Token/Password**: Your API credential
   - **Server Endpoint**: REST API URL (e.g., https://mt4api.metaapi.cloud)
   - **Platform**: Select MT4 or MT5
4. Click "Link Account"

## Testing the Connection

After linking an account:

1. Click the "Sync" button on the integration row
2. Wait for the sync to complete
3. Check the status badge (should show "Success")
4. Verify the "Last Sync" timestamp updated
5. Check the leaderboard to see if the balance/profit updated

## Triggering Syncs

### Manual Sync

**Single Integration:**
```bash
curl -X POST http://localhost:3000/api/sync/mt4/trigger/{integrationId}
```

**All Integrations:**
```bash
curl -X POST http://localhost:3000/api/sync/mt4/trigger
```

### Automatic Sync

To set up automatic syncing every 15 minutes, edit your `server/index.ts`:

```typescript
import cron from 'node-cron';
import { handleMT4SyncAll } from './routes/sync';

// Schedule sync every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('[Cron] Running scheduled MT4 sync...');
  // Trigger sync through your internal function
});
```

Install node-cron:
```bash
pnpm add node-cron
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "MT4 Sync complete: 2 success, 0 failed",
  "synced": 2,
  "failed": 0
}
```

### Error Response

```json
{
  "success": false,
  "message": "MT4 Sync failed: Failed to fetch account data from MT4"
}
```

## Supported Account Data

The MT4 client fetches:
- Account Balance (current)
- Account Equity
- Profit/Loss (calculated from balance)
- Margin Level
- Number of Trades

## Troubleshooting

### "Failed to fetch account data from MT4"

**Possible causes:**
1. Invalid Account ID
2. Incorrect API Token/Password
3. Server endpoint is unreachable
4. Account doesn't have API access enabled
5. API credentials expired

**Solutions:**
- Verify credentials in Admin → Monitoring
- Test the endpoint URL in your browser/Postman
- Check broker documentation for API setup
- Re-link the account with correct credentials

### "No trader associated with this credential"

**Cause:** The trading credential hasn't been assigned to a trader yet

**Solution:**
- Go to Admin → Credentials
- Upload the credential (auto-assigns to first unassigned trader)
- Or manually assign in Admin → Assignments

### Sync Status Shows "Error"

1. Click on the integration row to see the error message
2. Check the Recent Sync History section for details
3. Verify API credentials are valid
4. Check if the MT4 account is still active on the broker
5. Delete and re-link the account

## File Structure

### Backend

- **`server/lib/mt4-client.ts`**: MT4/MT5 API communication
  - `fetchMT4AccountData()` - Fetch account data from API
  - `syncMT4Account()` - Full sync workflow
  - `testMT4Connection()` - Test API connection

- **`server/lib/supabase-client.ts`**: Database operations (new functions)
  - `getActiveMT4Integrations()` - Get all active MT4 integrations
  - `createMT4Integration()` - Create new integration
  - `updateMT4IntegrationSyncStatus()` - Update sync status

- **`server/routes/sync.ts`**: API endpoints (new handlers)
  - `handleMT4SyncAll()` - Sync all integrations
  - `handleMT4SyncIntegration()` - Sync specific integration
  - `syncMT4Integration()` - Internal sync logic

- **`server/index.ts`**: Route registration
  - `POST /api/sync/mt4/trigger` - Trigger all syncs
  - `POST /api/sync/mt4/trigger/:integrationId` - Trigger specific sync

### Frontend

- **`client/lib/mt4.ts`**: MT4 integration management
  - `linkMT4Account()` - Link new account
  - `getMT4Integrations()` - Get all integrations
  - `triggerMT4SyncAll()` - Trigger sync via API
  - `triggerMT4SyncIntegration()` - Trigger single sync
  - `getRecentMT4Syncs()` - Get sync history

- **`client/pages/AdminPage.tsx`**: Admin UI
  - Monitoring tab with MT4 integration section
  - Link MT4 form with platform selection
  - Integrations table with sync controls
  - Sync history display

### Database

- **`mt4_integrations` table**: Store MT4 connection details
  - `id` (UUID, primary key)
  - `credential_id` (UUID, foreign key to trading_credentials)
  - `mt4_account_id` (TEXT, MT4 account number)
  - `mt4_api_token` (TEXT, API credential)
  - `mt4_server_endpoint` (TEXT, API endpoint URL)
  - `mt4_platform` (TEXT, 'mt4' or 'mt5')
  - `sync_status` (TEXT, pending/syncing/success/error)
  - `last_sync` (TIMESTAMP, last sync time)
  - `last_error` (TEXT, error message if failed)
  - `is_active` (BOOLEAN, active/inactive)
  - `created_at`, `updated_at` (timestamps)

## API Response Times

- MT4 API fetch: ~500ms - 2s (varies by provider)
- Database update: ~100-200ms
- Total per integration: ~1-3 seconds
- Full sync (5 integrations): ~5-15 seconds

## Security Considerations

⚠️ **Important**: API tokens and passwords are stored in the database and used server-side only.

For enhanced security:

1. **Use Environment Variables**: Store sensitive data in `.env` instead of database
2. **Encrypt at Rest**: Enable database encryption in Supabase
3. **Use RLS Policies**: Restrict access to mt4_integrations table
4. **Rotate Tokens**: Regularly change API tokens/passwords
5. **Audit Logs**: Monitor sync attempts and failures

### Set RLS Policy (Optional)

```sql
-- Only service role can read/write MT4 integrations
CREATE POLICY "Service role only" ON mt4_integrations
  FOR ALL USING (auth.role() = 'service_role');
```

## MetaApi Alternative Setup

If using MetaApi:

1. **Account Setup Cost**: ~$10-20/month per account
2. **No Broker Restrictions**: Works with any broker that supports MT4/MT5
3. **Professional API**: More reliable and feature-rich
4. **Easy Integration**: Well-documented REST API
5. **Support**: 24/7 customer support

## Next Steps

1. ✅ Set up API credentials with your broker/MetaApi
2. ✅ Test API connection (try the endpoint in browser)
3. ✅ Link MT4/MT5 accounts in Admin → Monitoring
4. ✅ Test manual sync for each account
5. ✅ Set up automated sync (cron job or scheduler)
6. ✅ Monitor sync history for errors
7. ✅ Verify leaderboard updates correctly

## Support

For issues:
1. Check Recent Sync History for error details
2. Test API endpoint with curl/Postman
3. Verify trader is assigned to credential
4. Check broker API documentation
5. Review server logs for [MT4 Sync] messages

## Migration from MyFXBook

If upgrading from MyFXBook:

1. The MyFXBook integrations table remains for backward compatibility
2. New accounts should use MT4/MT5 instead
3. To deactivate MyFXBook, delete integrations from `myfxbook_integrations` table
4. Optionally drop the MyFXBook table: `DROP TABLE myfxbook_integrations;`

---

**Last Updated**: 2024
**Version**: 1.0
