# Forex Factory Manual Trader Upload Guide

## Overview

This guide explains how to manually upload Forex Factory trader data to the leaderboard daily.

Since Forex Factory doesn't provide a public API and blocks automated scrapers, the manual upload method is the best way to keep your leaderboard updated with real Forex Factory data.

## How It Works

1. You visit Forex Factory Trade Explorer and identify your top traders
2. You copy the trader data (rank, name, username, balance, profit %, trades)
3. You paste it into the Admin Panel
4. The system automatically updates the leaderboard rankings

## Step-by-Step Guide

### Step 1: Gather Forex Factory Trader Data

1. Go to **https://www.forexfactory.com/trade-explorer**
2. Find your top 10 traders (or as many as you want)
3. Note down for each trader:
   - **Rank** - Their position (1-10)
   - **Name** - Full name displayed on Forex Factory
   - **Username** - Their unique username
   - **Balance** - Current account balance
   - **Profit %** - Profit percentage
   - **Trades** - Number of trades

### Step 2: Format the Data (CSV)

The system accepts **CSV format** (Comma-Separated Values):

```
rank,trader_name,trader_username,balance,profit_percent,trades
1,John Doe,johndoe,25000,45.5,120
2,Jane Smith,janesmith,22000,40.2,110
3,Robert Johnson,rjohnson,20500,38.1,105
```

**Important:** Each line must have all 6 fields separated by commas.

### Step 3: Upload in Admin Panel

1. Go to **Admin Panel → Monitoring**
2. Scroll to **"Upload Forex Factory Traders"** section
3. You'll see a text area with placeholder data
4. Click **"Load Template"** to get a template (optional)
5. Paste your trader data into the text area
6. Click **"Upload Traders"** button

### Step 4: Verify the Upload

After uploading:
- ✅ **Green Success Message** = Traders updated successfully
- ⚠️ **Red Error Message** = Some traders had errors (see details)
- Check the integration table to see which traders were updated

## Example Data Format

### Correct Format ✅
```
rank,trader_name,trader_username,balance,profit_percent,trades
1,John Doe,johndoe,25000,45.5,120
2,Jane Smith,janesmith,22000,40.2,110
```

### What NOT to Do ❌
```
1, John Doe, johndoe, 25000, 45.5, 120  (spaces around commas)
John Doe,johndoe,25000,45.5,120         (missing rank number)
1,John Doe,johndoe,25000,45.5           (missing trades count)
```

## Common Issues & Solutions

### "Trader not found in system"
**Cause:** The trader name doesn't match any trader in your system

**Solution:**
1. Check that the trader exists in Admin → Traders
2. Make sure the name spelling matches exactly
3. If needed, create the trader first, then upload

### "No valid trader data found"
**Cause:** CSV format is incorrect

**Solution:**
1. Check that each line has exactly 6 comma-separated values
2. Avoid extra spaces around commas
3. Use the "Load Template" button for correct format

### "Balance is negative or zero"
**Cause:** Invalid balance value

**Solution:**
1. Ensure balance is a positive number
2. Remove any $ signs or commas from the number
3. Example: Use `25000` not `$25,000`

## Tips for Daily Updates

**Best Practices:**
1. Update daily at the same time for consistency
2. Use the template button to save time formatting
3. Copy-paste from Forex Factory directly when possible
4. Keep a record of daily uploads for audit trail
5. Double-check trader names before uploading

**Automation Ideas:**
1. Set a calendar reminder for daily upload time
2. Keep a spreadsheet of top traders
3. Use Google Sheets to format the data, then copy to Admin Panel
4. Consider delegating to a team member

## Data Mapping

When you upload trader data, it updates the leaderboard:

| CSV Field | Leaderboard Field | Notes |
|-----------|------------------|-------|
| rank | Ranking Position | Determines leaderboard order |
| trader_name | Trader Name | Displayed on leaderboard |
| trader_username | Username | For reference |
| balance | Current Balance | Updated balance |
| profit_percent | Profit % | Key metric |
| trades | Trades Count | Activity indicator |

## Profit Calculation

The system calculates profit in two ways:

1. **From CSV profit_percent**: Uses the value you provide directly
2. **Auto-calculated**: `(balance - 10000) / 10000 * 100`

If your uploaded profit % doesn't match the calculation, the uploaded value takes priority.

## Security & Privacy

- ✅ Data is stored securely in Supabase
- ✅ Only admins can upload data
- ✅ Upload history is logged
- ✅ No passwords or sensitive info required
- ✅ Traders can only see their own data on the public leaderboard

## Troubleshooting

### Upload appears to work but leaderboard doesn't update
1. Go to Leaderboard page and refresh (F5)
2. Wait a few seconds - data may still be syncing
3. Check Admin → Traders to verify traders exist
4. Check error messages in the upload section

### Some traders uploaded, some didn't
1. Check the **red error messages** shown after upload
2. The errors explain which traders had issues
3. Fix those specific entries and re-upload just those traders

### How do I undo an upload?
1. Unfortunately, there's no automatic undo
2. You can re-upload with the previous data
3. Contact your administrator for manual data restoration

## Advanced Features

### Bulk Update Multiple Times Daily
You can upload multiple times per day:
1. Update with morning data
2. Update again with afternoon data
3. Each upload overwrites the previous values

### Mixing Manual & Automated Sources
You can use:
1. Manual uploads for Forex Factory traders
2. Automated sync for MT4/MT5 accounts
3. Automated sync for MyFXBook accounts
4. All in the same leaderboard!

## Support

If you encounter issues:

1. **Check the error message** - It usually explains what went wrong
2. **Verify the CSV format** - Use the template as reference
3. **Check trader names** - Make sure they exist in the system
4. **Contact your administrator** - They can help debug

## FAQs

**Q: How often should I update?**
A: Daily is recommended, but you can do it more or less frequently based on your competition rules.

**Q: Can I edit trader data after uploading?**
A: Not through the upload system. Contact your administrator for manual edits.

**Q: What if a trader's username changes?**
A: Use the new username in the CSV upload.

**Q: Can I upload just one trader?**
A: Yes, you can upload any number of traders (1-100+).

**Q: Is there a maximum number of traders I can upload?**
A: No hard limit, but 100 traders per upload is recommended for best performance.

**Q: What happens to old data when I upload new data?**
A: New data overwrites old data for matched traders. Traders not in the upload keep their old data.

---

**Last Updated:** December 2024  
**Status:** Active - Manual upload fully implemented
