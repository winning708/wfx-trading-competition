# Forex Factory Trade Explorer Integration Guide

This guide explains how to integrate Forex Factory Trade Explorer with the WFX Trading Competition platform using RapidAPI's Forex Factory Scraper.

## Overview

The Forex Factory integration uses **RapidAPI** to automatically fetch trading performance data from Forex Factory's public leaderboard. This allows you to track trader performance in real-time and update leaderboard standings.

## Prerequisites

- Active Forex Factory account with a trading system
- Free RapidAPI account (2 minutes to create)
- Your Forex Factory username/system details

## Step 1: Set Up RapidAPI Access

### 1.1 Create RapidAPI Account (if you don't have one)

1. Visit **https://rapidapi.com**
2. Click **Sign Up**
3. Complete registration (2 minutes)

### 1.2 Subscribe to Forex Factory Scraper

1. Go to **[RapidAPI Forex Factory Scraper](https://rapidapi.com/ousema.frikha/api/forex-factory-scraper1)**
2. Click **Subscribe to Test** (free tier)
3. Agree to the terms
4. You're now subscribed!

### 1.3 Get Your API Key

1. Log in to your RapidAPI account
2. Go to **Dashboard** or navigate to any API page
3. Find your **API Key** displayed at the top
4. Copy it to your clipboard
5. Store it securely (never share this key)

**Example API Key:** `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx` (will look like a random string)

## Step 2: Get Your Forex Factory Credentials

### 2.1 Forex Factory Account Username

Your public username on Forex Factory:

1. Log in to **https://www.forexfactory.com**
2. Click your profile/avatar in the top right
3. Go to **Settings → Profile**
4. Your username is displayed (e.g., `johndoe`)
5. Copy it

### 2.2 System ID

The ID of the trading system you want to track:

1. Log in to Forex Factory
2. Go to **My Systems** or **Trade Explorer**
3. Click on the system you want to track
4. The System ID will be:
   - In the URL: `/system/view/system_12345`
   - Or displayed on the system details page
5. Copy the System ID (e.g., `system_12345`)

## Step 3: Link Your Account in Admin Panel

### 3.1 Access Admin Panel

1. Navigate to your application's **Admin Panel**
2. Click on the **Monitoring** tab

### 3.2 Click "Link Account"

1. Click the **Link Account** button
2. A form will appear with fields for:
   - Trading Credential
   - Forex Factory Account Username
   - RapidAPI Key
   - System ID

### 3.3 Fill in the Form

**Select Trading Credential:**
- Choose the credential that corresponds to this trading account
- If you don't have a credential, create one in the **Credentials** tab first

**Forex Factory Account Username:**
- Enter your Forex Factory username
- Example: `johndoe`
- Must match your public Forex Factory profile name
- Case-insensitive but should be exact

**RapidAPI Key:**
- Paste your RapidAPI API Key (from Step 1.3)
- This is stored securely in the database
- Never share this key with others

**System ID:**
- Enter the System ID from your Forex Factory system
- Example: `system_12345`
- This identifies which trading system to track

### 3.4 Test the Connection (Recommended)

Before linking:
1. Click **Test Connection** to verify credentials
2. If successful, you'll see a confirmation message
3. If it fails, check:
   - RapidAPI key is correct
   - Username matches your Forex Factory profile
   - Your account has an active trading system on the leaderboard

### 3.5 Link the Account

1. Once validated, click **Link Account**
2. The form will close and your integration will be added
3. You'll see it in the integrations table below

## Step 4: Sync Performance Data

### 4.1 Manual Sync

To manually sync data immediately:
1. In the **Monitoring** tab, find your Forex Factory integration
2. Click the **Sync** button next to the integration
3. Wait for the sync to complete (usually 2-5 seconds)
4. Check the status indicator:
   - ✅ **Green** = Successful sync
   - ❌ **Red** = Sync failed (hover to see error details)

### 4.2 Sync All Integrations

To sync all linked Forex Factory accounts at once:
1. Click the **Sync All** button
2. Confirm the action (if prompted)
3. Wait for all syncs to complete
4. Check status for each integration

### 4.3 Automatic Sync (Optional)

Contact your administrator to set up automatic periodic syncing:
- Every 5 minutes
- Hourly
- Daily
- Custom schedule

## Step 5: Monitor Integration Status

In the **Monitoring** tab, you'll see a table with your integrations:

### Table Columns

| Column | Description |
|--------|-------------|
| **Credential** | The trading credential linked to this Forex Factory account |
| **Forex Factory Account** | Your Forex Factory username |
| **Sync Status** | Current status of the integration |
| **Last Sync** | When the account was last synced |
| **Actions** | Sync, delete, or manage the integration |

### Status Meanings

- **Pending** - Waiting for first sync (gray indicator)
- **Syncing** - Currently fetching data (blue, animated)
- **Success** - Last sync was successful (green, ✓)
- **Error** - Sync failed (red, ⚠️)
  - Hover over error status to see the error message
  - Common errors:
    - "Trader not found in leaderboard"
    - "Invalid RapidAPI key"
    - "Network error"

### View Sync History

Each integration shows its recent sync history. You can:
- See timestamp of last successful sync
- View any error messages
- Track sync frequency

## Troubleshooting

### "Invalid RapidAPI key"
**Cause:** The RapidAPI key is incorrect or expired

**Solutions:**
1. Verify the key in your RapidAPI dashboard
2. Copy it again carefully (avoid extra spaces)
3. Regenerate the key in RapidAPI if needed
4. Update the integration with the new key

### "Trader not found in leaderboard"
**Cause:** The username doesn't match any trader on Forex Factory's leaderboard

**Solutions:**
1. Verify your Forex Factory username is correct
2. Make sure your trading system is active and visible on the leaderboard
3. Check that you have trades and performance data visible
4. Try a different username format (some users have display names)

### "Connection timeout"
**Cause:** Network connectivity issue or RapidAPI service unavailable

**Solutions:**
1. Check your internet connection
2. Verify RapidAPI is online (check their status page)
3. Try again in a few moments
4. Contact support if issues persist

### Sync still shows "Error" after fixing above

**Steps to debug:**
1. Check the exact error message (hover over red status)
2. Review the error in the sync history section
3. Verify all credentials are correct
4. Try a manual sync to get the latest error
5. Contact your administrator with:
   - The exact error message
   - Your Forex Factory username
   - When the issue started

## Data Mapping

When syncing, the following data is extracted from Forex Factory:

| Forex Factory Data | Mapped To | Notes |
|--------------------|-----------|-------|
| Trader Rank | Leaderboard Position | Determines ranking |
| Return % | Profit Percentage | Key performance metric |
| Pips | Estimated Trades | Used to estimate activity |
| System Name | Account Identifier | For tracking |

## Data Privacy & Security

- **API Keys:** Stored encrypted in the database
- **Access Control:** Only administrators can view API keys
- **Sync Logs:** Stored for auditing and troubleshooting
- **Performance Data:** Visible to all traders on the leaderboard (public data from Forex Factory)

## Limits & Quotas

**RapidAPI Free Tier:**
- 100 requests per month (approximately 3-4 syncs per day)
- Sufficient for periodic syncing
- Upgrade if you need more frequent syncs

**Sync Frequency Recommendations:**
- Every 5 minutes: For active competitions (requires paid RapidAPI plan)
- Hourly: Standard for most competitions
- Daily: For casual tracking
- Manual sync: When needed

## Support & Help

If you encounter issues:

1. **Check the error message** - Hover over the red status indicator
2. **Review this guide** - Most issues are covered in troubleshooting
3. **Check RapidAPI status** - Verify the service is online
4. **Contact administrator** with:
   - Your Forex Factory username
   - The system ID you're tracking
   - The exact error message
   - When the issue started

## Related Documentation

- [Quick Start Guide](./QUICK_START_FOREX_FACTORY.md) - 5-minute setup
- [Admin Panel Guide](./ADMIN_GUIDE.md) - General admin panel usage
- [MT5 Integration](./MT5_SETUP.md) - For MT5 traders
- [MyFXBook Integration](./MYFXBOOK_SETUP.md) - Alternative data source

## API Service

**Service:** RapidAPI - Forex Factory Scraper  
**URL:** https://rapidapi.com/ousema.frikha/api/forex-factory-scraper1  
**Authentication:** x-rapidapi-key header  
**Rate Limit:** Based on subscription tier  
**Uptime:** https://status.rapidapi.com/  

---

**Last Updated:** December 2024  
**Status:** Active - Tested and working
