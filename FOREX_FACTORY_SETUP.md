# Forex Factory Trade Explorer Integration Guide

This guide explains how to integrate Forex Factory Trade Explorer with the WFX Trading Competition platform to automatically sync trader performance data.

## Overview

The Forex Factory integration allows traders to link their Forex Factory accounts to track trading performance in real-time. Performance data (balance, profit/loss) is automatically synced to update leaderboard standings.

## Prerequisites

- Active Forex Factory Trade Explorer account
- Forex Factory API credentials
- System ID for the trading system you want to track

## Step 1: Get Your Forex Factory Credentials

### 1.1 Account Username
Your Forex Factory account username. For example: `johndoe`

**How to find it:**
- Log in to your Forex Factory account
- Go to your profile
- Your username is displayed in the profile settings

### 1.2 API Key
Request an API key from Forex Factory:

1. Log in to Forex Factory
2. Navigate to **Settings → API & Integrations**
3. Click **Create New API Key**
4. Select appropriate permissions (you need at least read access to account stats)
5. Copy the generated API key
6. Store it securely (do not share it)

### 1.3 System ID
The specific trading system you want to track:

1. Log in to Forex Factory
2. Go to **My Systems**
3. Click on the system you want to track
4. The System ID will be in the URL or system details page
5. Example: `system_12345` or `abc-xyz-123`

## Step 2: Link Your Account in Admin Panel

### 2.1 Access Admin Panel
1. Navigate to your application's Admin Panel
2. Click on the **Monitoring** tab
3. Click the **Link Account** button

### 2.2 Fill in the Form

**Select Trading Credential:**
- Choose the credential that corresponds to this trading account
- If you don't have a credential, create one first in the **Credentials** tab

**Forex Factory Account Username:**
- Enter your Forex Factory account username
- Example: `johndoe`

**API Key:**
- Paste your Forex Factory API key
- This will be stored securely in the database

**System ID:**
- Enter the specific system ID you want to track
- Example: `system_12345`

### 2.3 Verify Connection
Click **Link Account** to verify the connection. The system will:
1. Test the API connection
2. Validate your credentials
3. Confirm the system exists and is accessible

If the test is successful, your account will be linked and ready to sync.

## Step 3: Sync Performance Data

### 3.1 Manual Sync
To manually sync data immediately:
1. In the **Monitoring** tab, find your Forex Factory integration
2. Click the **Sync** button next to the integration
3. Wait for the sync to complete (usually takes a few seconds)
4. Check the status indicator:
   - ✅ Green = Successful sync
   - ❌ Red = Sync failed (hover to see error details)

### 3.2 Sync All Integrations
To sync all linked Forex Factory accounts at once:
1. Click the **Sync All** button
2. Confirm the action
3. Wait for all syncs to complete

### 3.3 Automatic Sync (Optional)
Contact your administrator to set up automatic periodic syncing (e.g., every 5 minutes, hourly, daily).

## Step 4: Monitor Sync Status

In the **Monitoring** tab, you'll see a table with your integrations:

| Column | Description |
|--------|-------------|
| **Credential** | The trading credential linked to this Forex Factory account |
| **Forex Factory Account** | Your account username |
| **Sync Status** | Current status (Pending, Syncing, Success, Error) |
| **Last Sync** | When the account was last synced |
| **Actions** | Sync or Delete buttons |

### Interpreting Sync Status

- **Pending** - Not yet synced (gray)
- **Syncing** - Currently syncing data (blue, spinning icon)
- **Success** - Last sync was successful (green, ✓)
- **Error** - Sync failed (red, ⚠️) - hover to see error details

## Troubleshooting

### "API Key is invalid or expired"
- Check that your API key is correct
- Make sure the API key hasn't expired in Forex Factory
- Request a new API key if needed

### "System ID does not exist"
- Verify the System ID is correct
- Make sure the system hasn't been deleted
- Check that your API key has access to this system

### "Connection test failed"
- Verify internet connectivity
- Check Forex Factory service status
- Ensure your API key has the required permissions
- Verify the account username is correct

### Sync still shows "Error" after trying above steps
- Check the error message (hover over the red status)
- Review the admin logs for more details
- Contact support with the error message

## API Response Format

The Forex Factory API returns account data in this format:

```json
{
  "account_id": "system_id",
  "username": "account_username",
  "balance": 10500.00,
  "equity": 10250.00,
  "profit": 250.00,
  "total_trades": 145,
  "win_rate": 0.65,
  "drawdown": 0.12,
  "currency": "USD"
}
```

Data is synced to the leaderboard as:
- **Current Balance**: From the `balance` field
- **Profit %**: Calculated as `(balance - starting_balance) / starting_balance * 100`

## Deleting an Integration

To remove a Forex Factory integration:

1. In the **Monitoring** tab, find the integration
2. Click the **Delete** button
3. Confirm the deletion

The integration will be marked as inactive and no longer synced, but the historical data remains in the database.

## Data Privacy

- API keys are stored encrypted in the database
- Only authorized administrators can view API keys
- Sync data is logged for auditing purposes
- Performance data is visible to all traders on the leaderboard

## Support

If you encounter issues:

1. Check the error message in the sync status
2. Review the troubleshooting section above
3. Contact your competition administrator with:
   - Your account username
   - The system ID you're trying to sync
   - The exact error message
   - When the issue started

## Related Documentation

- [MT5 Integration Guide](./MT5_SETUP.md) - For MT5 REST API integration
- [Admin Panel Guide](./ADMIN_GUIDE.md) - For general admin panel usage
- [Quick Start](./QUICK_START.md) - For quick setup instructions
