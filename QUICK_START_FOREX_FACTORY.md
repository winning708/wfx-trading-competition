# Forex Factory Trade Explorer - Quick Start (5 minutes)

## Prerequisites

You'll need a **free RapidAPI account**. This takes 2 minutes to set up.

## Step 1: Get Your RapidAPI Key (2 minutes)

1. Go to **[RapidAPI Forex Factory Scraper](https://rapidapi.com/ousema.frikha/api/forex-factory-scraper1)**
2. Click **"Subscribe to Test"** (the free tier is available)
3. You'll be taken to your dashboard
4. Copy your **API Key** from the top section
5. Save it securely

## Step 2: Get Your Forex Factory Details (1 minute)

### Account Username
- Log in to Forex Factory
- Go to your profile
- Copy your username (e.g., `johndoe`)

### System ID
- Go to **My Systems** in Forex Factory
- Click on your trading system
- Find the System ID from the page URL or details
- Example: `system_12345`

## Step 3: Link Your Account in Admin Panel (1 minute)

1. Open **Admin Panel → Monitoring**
2. Click **Link Account** button
3. Fill in the form:
   - **Trading Credential**: Select your credential
   - **Forex Factory Account Username**: `johndoe`
   - **RapidAPI Key**: Paste your RapidAPI key
   - **System ID**: `system_12345`
4. Click **Test Connection** to verify (optional but recommended)
5. Click **Link Account**

## Step 4: Sync Your Data (1 minute)

1. Click **Sync** next to your integration
2. Wait for sync to complete
3. Check status:
   - ✅ Green = Success
   - ❌ Red = Error (hover for details)

## What Happens Next?

- Your trading performance is synced from Forex Factory leaderboard
- Balance and profit/loss updates automatically
- You appear on the live leaderboard rankings
- Historical data is preserved for audit trails

## Common Issues

| Issue | Solution |
|-------|----------|
| "RapidAPI key is invalid" | Check your RapidAPI dashboard, regenerate if needed |
| "Trader not found in leaderboard" | Verify your Forex Factory username is exact and active on the leaderboard |
| "System ID not found" | Check the System ID is correct in Forex Factory My Systems |
| Connection timeout | Check your internet, verify RapidAPI is reachable |

## Troubleshooting

**Q: Where do I find my RapidAPI key?**
A: Log into your RapidAPI account → Dashboard → Look for "API Key" at the top of any API page

**Q: My username isn't found?**
A: Your Forex Factory account must have an active trading system on the leaderboard to appear in results

**Q: Do I need to pay for RapidAPI?**
A: No! The free tier includes enough requests for regular syncing

## Need Help?

- See [FOREX_FACTORY_SETUP.md](./FOREX_FACTORY_SETUP.md) for detailed guide
- Contact your competition administrator
- Check error messages in the sync status (red indicator)

**That's it! Your Forex Factory account is now linked and syncing.** 🚀
