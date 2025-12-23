# Forex Factory Trade Explorer Integration Guide

This guide explains how to integrate Forex Factory Trade Explorer with the WFX Trading Competition platform using a web scraper.

## Overview

The Forex Factory integration uses a **direct web scraper** to automatically fetch trading performance data from Forex Factory's public pages. No third-party API required!

The scraper accesses your public trader profile and automatically extracts:
- Current account balance
- Profit/loss percentage
- Number of trades executed
- Drawdown information
- Return metrics

Data is then synced to the leaderboard to keep rankings up-to-date.

## Prerequisites

- Active Forex Factory account with a public trading system
- Your Forex Factory username
- Your Trader ID or System ID from Forex Factory

**Note:** Your trading system must be publicly visible on the Forex Factory leaderboard for the scraper to access it.

## Step 1: Locate Your Forex Factory Credentials

### 1.1 Find Your Account Username

1. Log in to **https://www.forexfactory.com**
2. Click on your **profile/avatar** (top right)
3. Go to **Settings → Profile**
4. Your username is displayed here
5. Copy it exactly as shown (e.g., `Winning708`)

### 1.2 Find Your Trader ID or System ID

The scraper needs your Trader ID to fetch your data. You can find this several ways:

**Method 1: From Trade Explorer**
1. Go to Forex Factory **Trade Explorer**
2. Find your trading system in the list
3. Click on it
4. The Trader ID will be in:
   - The URL: `https://www.forexfactory.com/system/2001661536`
   - Or displayed on the system details page
5. Copy the numeric ID (e.g., `2001661536`)

**Method 2: From Your System Page**
1. Go to **My Systems** in Forex Factory
2. Click on your system
3. Look at the URL or page for the System ID
4. Copy it

**Method 3: From the Leaderboard**
1. Check the Trade Explorer leaderboard
2. Find your system in the rankings
3. Click on it to get the ID

The ID can be any of these formats:
- Numeric: `2001661536`
- Named: `Trader_1` or `Trader 1`
- System URL format: `system_12345`

All formats work with the scraper.

## Step 2: Link Your Account in Admin Panel

### 2.1 Access Admin Panel

1. Navigate to your application's **Admin Panel**
2. Click on the **Monitoring** tab

### 2.2 Click "Link Account" Button

1. Click the **Link Account** button (top right)
2. A form will appear asking for:
   - Trading Credential
   - Forex Factory Account Username
   - API Key (placeholder - can be any value)
   - System ID

### 2.3 Fill in the Form

**Select Trading Credential:**
- Choose the credential that corresponds to this Forex Factory account
- If you don't have one, create it first in the **Credentials** tab
- Select the dropdown and choose your credential

**Forex Factory Account Username:**
- Enter your Forex Factory username exactly
- Example: `Winning708`
- This must match your public profile name

**API Key Field:**
- Enter any value here (the scraper doesn't require a real API key)
- You can enter your Forex Factory username again or any placeholder
- This field is kept for UI consistency

**System ID:**
- Enter your Trader ID or System ID
- Examples:
  - `2001661536` (numeric)
  - `Trader_1` (system name)
  - `system_12345` (URL format)
- Copy exactly as it appears on Forex Factory

### 2.4 Test the Connection

**Before linking, always test:**
1. Click the **Test Connection** button
2. Wait a few seconds for the result
3. If successful: "Successfully connected! Trader ... has X% return"
4. If failed: Check the error message and verify your details

### 2.5 Link the Account

Once the test passes:
1. Click **Link Account** button
2. The form will close and your integration will be added
3. You'll see it in the integrations table below

## Step 3: Sync Your Trading Data

### 3.1 Manual Sync

To sync data immediately:
1. In the **Monitoring** tab, find your Forex Factory integration
2. Click the **Sync** button next to it
3. Wait for the sync to complete (usually 2-5 seconds)
4. Check the status:
   - ✅ **Green (✓)** = Successful sync
   - ❌ **Red (⚠️)** = Sync failed - hover to see error

### 3.2 Sync All Integrations

To sync all linked Forex Factory accounts at once:
1. Click the **Sync All** button
2. Wait for all syncs to complete
3. Check status for each integration in the table

### 3.3 Automatic Sync (Optional)

Contact your administrator to enable automatic syncing:
- Every 5 minutes (for active competitions)
- Hourly (standard)
- Daily (for casual tracking)
- Custom schedule

## Step 4: Monitor Integration Status

In the **Monitoring** tab, you'll see a table showing your integrations:

### Table Columns

| Column | Description |
|--------|-------------|
| **Credential** | The trading credential linked to this Forex Factory account |
| **Forex Factory Account** | Your Forex Factory username |
| **Sync Status** | Current status of the integration (Pending, Syncing, Success, Error) |
| **Last Sync** | When the account was last synced successfully |
| **Actions** | Sync, view details, or delete the integration |

### Status Meanings

- **Pending** - Waiting for first sync (gray dot)
- **Syncing** - Currently fetching data (blue animated dot)
- **Success** - Last sync was successful (green ✓)
- **Error** - Sync failed (red ⚠️) - **hover to see why**

### Viewing Error Details

If you see a red error status:
1. Hover your mouse over the red indicator
2. A tooltip will show the error message
3. Common errors:
   - "Trader account has no public profile"
   - "Could not find trader in leaderboard"
   - "Network error - Forex Factory unreachable"

### Sync History

Below each integration, you can see:
- Timestamp of last successful sync
- Any error messages from recent attempts
- Sync frequency and status

## How the Scraper Works

### Data Flow

1. **Request** → You click "Sync" in the Admin Panel
2. **Fetch** → The scraper accesses your public Forex Factory profile
3. **Parse** → It extracts your trading statistics
4. **Store** → Data is saved to the leaderboard database
5. **Display** → Your ranking updates in the competition

### Data Extracted

The scraper fetches:
- **Balance**: Your current account balance
- **Return %**: Profit/loss percentage
- **Trades**: Estimated from pips traded
- **Win Rate**: From your statistics
- **Drawdown**: From your account metrics

### Limitations

- **Public Only**: Only works with publicly visible Forex Factory systems
- **Rate Limited**: To prevent excessive requests to Forex Factory
- **HTML Parsing**: Relies on Forex Factory's page structure (may break if they redesign)

## Troubleshooting

### "Could not find trader in leaderboard"

**Cause:** The username doesn't match or the system isn't visible

**Solutions:**
1. Verify your Forex Factory username is exact (case-sensitive for some fields)
2. Ensure your system is public on the Trade Explorer leaderboard
3. Check that the system ID is correct
4. Try syncing again - there may be a temporary network issue

### "Trader account has no public profile"

**Cause:** Your Forex Factory system is private or not visible

**Solutions:**
1. Log into Forex Factory
2. Go to your system settings
3. Ensure it's set to "Public" visibility
4. Make sure your trades are visible on the leaderboard
5. Try syncing again after making it public

### "Network error - Forex Factory unreachable"

**Cause:** Temporary connectivity issue with Forex Factory or your network

**Solutions:**
1. Check your internet connection
2. Verify Forex Factory is online (try visiting https://www.forexfactory.com)
3. Wait a moment and try syncing again
4. Check if Forex Factory has any service status alerts
5. Contact support if the issue persists

### Sync Shows "Error" but No Message

**Steps to debug:**
1. Click the Sync button again to get a fresh error message
2. Check the sync history for previous error details
3. Verify all credentials are exactly correct
4. Ensure the System ID matches what's on Forex Factory
5. Contact your administrator with the exact error message

## Data Privacy & Security

- **No Third-Party API**: Data is scraped directly - no intermediary services
- **Public Data Only**: We only access publicly visible Forex Factory information
- **No Credentials Stored**: Your Forex Factory password is never required
- **Audit Logs**: All sync attempts are logged for security
- **Transparent**: You can see exactly what data is being fetched

## Limitations & Considerations

### Technical Limitations

- **HTML-Dependent**: The scraper relies on Forex Factory's page structure. If they redesign, the scraper may need updating
- **Rate Limiting**: Forex Factory may rate-limit excessive requests
- **Timing**: Data syncing takes 2-5 seconds per integration

### Practical Limitations

- **Public Systems Only**: Your Forex Factory system must be publicly visible
- **Manual or Scheduled Sync**: Data updates when you sync, not in real-time
- **No Historical Data Pull**: The scraper gets current data only

### Best Practices

1. **Keep System Public**: Ensure your Forex Factory system remains publicly visible
2. **Regular Syncing**: Sync regularly to keep leaderboard data current
3. **Verify Data**: Check that synced data looks correct in the leaderboard
4. **Save Credentials**: Keep your Forex Factory username and System ID accessible

## Advanced Options

### Manual Sync with Verification

If you want to verify sync before committing:
1. Click Sync to fetch latest data
2. Click the integration to view extracted data
3. Confirm the data matches your Forex Factory stats
4. Data is automatically saved on successful sync

### Bulk Syncing

To sync all integrations at once:
1. Click **Sync All** button
2. All linked accounts will sync in parallel
3. View status for each in the table

### Deleting an Integration

To remove a Forex Factory integration:
1. Find it in the Monitoring table
2. Click the **Delete** button (trash icon)
3. Confirm the deletion
4. The integration is marked inactive but historical data remains

## Support & Help

If you encounter issues:

1. **Check Error Message** - Hover over red status indicator
2. **Review Troubleshooting** - See section above for common issues
3. **Verify Details** - Double-check username and System ID
4. **Test Connection** - Use "Test Connection" before linking
5. **Contact Administrator** - Provide:
   - Your Forex Factory username
   - System ID you're using
   - Exact error message
   - When the issue started

## Related Documentation

- [Quick Start Guide](./QUICK_START_FOREX_FACTORY.md) - 5-minute setup
- [MyFXBook Integration](./MYFXBOOK_SETUP.md) - Alternative integration
- [MT5 Integration](./MT5_SETUP.md) - For MT5 traders
- [Admin Panel Guide](./ADMIN_GUIDE.md) - General admin features

## FAQ

**Q: Can I use a demo account?**
A: Only if it's publicly visible on Forex Factory's leaderboard

**Q: Does the scraper update in real-time?**
A: No, data updates when you click Sync or when scheduled syncing runs

**Q: Is there a cost for this integration?**
A: No, it's completely free. No third-party API subscriptions needed

**Q: What if Forex Factory changes their website?**
A: The scraper may need to be updated, but we'll handle that on our end

**Q: Can I sync multiple Forex Factory accounts?**
A: Yes, link as many as you want. Each will appear in the Integrations table

---

**Last Updated:** December 2024  
**Status:** Active - Web scraper fully implemented
