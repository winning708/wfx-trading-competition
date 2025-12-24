# Forex Factory Manual Upload - Quick Start (5 minutes)

## How It Works

Instead of automated scraping, you **manually upload** your top Forex Factory traders daily. This ensures you get real, up-to-date data from Forex Factory.

## What You Need

- Access to Forex Factory Trade Explorer
- Admin Panel access to your competition
- 5 minutes per day

## Step-by-Step

### Step 1: Visit Forex Factory (1 minute)

1. Go to **https://www.forexfactory.com/trade-explorer**
2. View your top traders (or top 10 you want to track)
3. Note their data:
   - Rank (1, 2, 3...)
   - Name (Full name)
   - Username
   - Balance
   - Profit %
   - Number of trades

### Step 2: Format as CSV (2 minutes)

Prepare data in this format (one line per trader):

```
rank,trader_name,trader_username,balance,profit_percent,trades
1,John Doe,johndoe,25000,45.5,120
2,Jane Smith,janesmith,22000,40.2,110
3,Robert Johnson,rjohnson,20500,38.1,105
```

**Tip:** Use the **"Load Template"** button in Admin Panel to get the format.

### Step 3: Upload in Admin Panel (2 minutes)

1. Go to **Admin Panel → Monitoring** tab
2. Find **"Upload Forex Factory Traders"** section
3. Paste your trader data in the text area
4. Click **"Upload Traders"** button
5. ✅ Done! Leaderboard is now updated with real Forex Factory data

## Example

**From Forex Factory:**
```
Rank: 1
Trader: John Doe (@johndoe)
Balance: $25,000
Profit: 45.5%
Trades: 120
```

**Format as CSV:**
```
1,John Doe,johndoe,25000,45.5,120
```

**Paste into Admin Panel and click Upload!**

## What Happens

When you upload:
- ✅ Trader data is validated
- ✅ Leaderboard is updated with current balances
- ✅ Profit percentages are recalculated
- ✅ Rankings are refreshed
- ✅ Green success message appears

## Tips

- **Update daily** at a consistent time
- **Copy from Forex Factory directly** for accuracy
- **Use the template** to save time formatting
- **Keep backups** of daily uploads (optional)
- **5 minutes** - That's all it takes!

## Troubleshooting

**Q: Trader not found?**
A: Make sure the trader exists in Admin → Traders first

**Q: CSV format error?**
A: Click "Load Template" to see correct format. Each line needs 6 comma-separated values.

**Q: Upload says success but leaderboard didn't update?**
A: Refresh the leaderboard page (F5). Changes appear instantly after upload.

## Need More Help?

See [FOREX_FACTORY_MANUAL_UPLOAD.md](./FOREX_FACTORY_MANUAL_UPLOAD.md) for detailed guide with troubleshooting and advanced tips.

---

**That's it!** Your leaderboard now shows real Forex Factory data, updated daily by you. 🚀
