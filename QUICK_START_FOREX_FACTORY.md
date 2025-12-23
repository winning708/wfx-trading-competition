# Forex Factory Trade Explorer - Quick Start (5 minutes)

## How It Works

This integration uses a **direct web scraper** to fetch your trading data from Forex Factory. 
**No API key required!** Just your username and system ID.

## Step 1: Get Your Forex Factory Details (2 minutes)

### Your Account Username
- Log in to **https://www.forexfactory.com**
- Go to your **Profile** or **Settings**
- Copy your username (e.g., `Winning708`)
- This is what appears on the leaderboard

### Your System ID or Trader ID
- Go to **Trade Explorer** in Forex Factory
- Find your trading system
- The System ID is in the URL or page details
- Examples:
  - `2001661536` (numeric trader ID)
  - `Trader_1` (system name)
  - `system_12345` (system ID)

## Step 2: Link Your Account in Admin Panel (2 minutes)

1. Open **Admin Panel → Monitoring** tab
2. Click **Link Account** button
3. Fill in the form:
   - **Trading Credential**: Select your credential
   - **Forex Factory Account Username**: `Winning708`
   - **API Key**: Can be any value (not currently used, but required)
   - **System ID**: `2001661536`
4. Click **Test Connection** to verify
5. Click **Link Account**

## Step 3: Sync Your Data (1 minute)

1. Click **Sync** next to your integration
2. Wait for sync to complete (usually 2-5 seconds)
3. Check the status:
   - ✅ **Green** = Success - data fetched and updated
   - ❌ **Red** = Error (hover to see details)

## What Happens Next?

- Your trading performance is automatically fetched from Forex Factory
- Balance and profit/loss updates are synced to the leaderboard
- Your account ranks appear in the live leaderboard
- Historical data is preserved for auditing

## How The Scraper Works

The system automatically:
1. Scrapes your public Forex Factory trader profile
2. Extracts your balance, profit %, and trading stats
3. Syncs the data to our leaderboard
4. Updates every time you click Sync (or automatically on schedule)

**Note:** The scraper uses your public Forex Factory profile, so your system must be visible on the Forex Factory leaderboard.

## Common Issues

| Issue | Solution |
|-------|----------|
| "Could not find trader" | Verify your Forex Factory username is exact and public on leaderboard |
| Connection fails | Ensure Forex Factory website is accessible; try again in a moment |
| No data returned | Check that your system is active and visible on Forex Factory Trade Explorer |

## Troubleshooting

**Q: What if my profile is private?**
A: The scraper needs your system to be visible on the Forex Factory leaderboard. Make sure your Trade Explorer system is public.

**Q: Do I need an API key from Forex Factory?**
A: No! The scraper directly accesses public data. The API Key field can contain any value.

**Q: How often does it sync?**
A: Manual sync when you click the Sync button. Contact your administrator for automatic periodic syncing.

**Q: Can I use a different username?**
A: Yes, as long as the username matches your public Forex Factory profile exactly.

## Need Help?

- See [FOREX_FACTORY_SETUP.md](./FOREX_FACTORY_SETUP.md) for detailed setup guide
- Check error messages in red status indicators (hover for details)
- Contact your competition administrator

**That's it! Your Forex Factory account is now linked and syncing.** 🚀
