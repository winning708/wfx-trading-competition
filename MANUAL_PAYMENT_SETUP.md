# 💳 Manual Payment System Setup (Binance & Bybit)

Since API keys aren't available for Binance and Bybit in your region, we've set up a **manual confirmation system** where you manually confirm payments directly in your admin dashboard.

---

## 🎯 How It Works

### **Payment Flow**

```
User Initiates Payment
        ↓
User Sees Your Payment Details (Merchant ID or Wallet Address)
        ↓
User Pays Directly (Outside Platform)
        ↓
You Receive Payment Notification
        ↓
You Confirm in Admin Dashboard
        ↓
System Sends Email Confirmation to User
        ↓
User Gains Access to Trading Account ✅
```

---

## 📋 Setup Checklist

### **Step 1: Get Your Binance Merchant ID** (Optional)

If you want to accept Binance payments:

1. Go to https://pay.binance.com
2. Login to your account
3. Go to **Merchant Dashboard**
4. Copy your **Merchant ID**
5. Paste it in your `.env` file:
   ```
   BINANCE_MERCHANT_ID=your_merchant_id_here
   ```

**What users see:** They'll see your Merchant ID in checkout and can pay directly to Binance

---

### **Step 2: Get Your Bybit TRC-20 USDT Wallet** (Optional)

If you want to accept USDT (TRC-20) payments:

1. Open your **Bybit wallet**
2. Select **USDT** token
3. Select **TRC-20** network
4. Copy your wallet address (starts with `T`)
5. Paste it in your `.env` file:
   ```
   BYBIT_USDT_WALLET_ADDRESS=TBWEPBZeA2LKMRYp3FxEL8mME7VVjMUvD3
   ```

**What users see:** They'll see your wallet address in checkout and can send USDT directly to it

---

### **Step 3: Update Your `.env` File**

Your `.env` file should now contain:

```env
# ============================================
# EMAIL SERVICE - RESEND
# ============================================
RESEND_API_KEY=re_[YOUR_RESEND_API_KEY]
EMAIL_FROM=noreply@wfxtrading.com

# ============================================
# PAYMENT - FLUTTERWAVE (Automated)
# ============================================
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_[YOUR_PUBLIC_KEY]
FLUTTERWAVE_SECRET_KEY=FLWSECK_[YOUR_SECRET_KEY]
FLUTTERWAVE_SECRET_HASH=[YOUR_WEBHOOK_HASH]

# ============================================
# PAYMENT - BINANCE (Manual)
# ============================================
BINANCE_MERCHANT_ID=[YOUR_MERCHANT_ID]

# ============================================
# PAYMENT - BYBIT (Manual)
# ============================================
BYBIT_USDT_WALLET_ADDRESS=[YOUR_TRC20_WALLET]
```

---

## 🔧 Confirming Manual Payments

### **In Your Admin Dashboard:**

1. Go to the **Admin Panel** → **Payments** tab
2. Look for **"Manual Payment Confirmation"** section
3. Select the payment method (Binance or Bybit)
4. Enter the user's email and payment amount
5. For **Bybit**: Also enter the transaction hash (TXID)
6. Click **"Confirm Payment & Send Email"**

The user will automatically receive a confirmation email! ✅

---

## 🔍 How to Find Payment Details

### **For Binance Payments**

1. User sends you money to your Merchant ID
2. You receive a notification from Binance
3. In admin: Enter the user's email and amount
4. Click confirm

### **For Bybit USDT Payments**

1. User sends you USDT to your wallet
2. You verify on **TronScan**: https://tronscan.org
   - Paste your wallet address
   - Find the incoming transaction
3. Copy the **Transaction Hash/TXID**
4. In admin: 
   - Enter user email and amount
   - Paste the transaction hash
   - Click confirm

---

## 💡 Pro Tips

✅ **Check Your Wallet Regularly**
- For Bybit: Use [TronScan](https://tronscan.org) to monitor incoming USDT
- Create a bookmark for easy access

✅ **Email Notifications**
- Once you confirm, users automatically get an email
- No need to contact them manually

✅ **Manual Log**
- Keep a spreadsheet of manual payments for your records
- Screenshot transaction hashes for reference

✅ **Test Before Going Live**
- Have a test user make a small payment first
- Confirm it in the admin dashboard to test the flow

---

## 🚀 Payment Methods Summary

| Method | Setup | Automation | Manual Confirmation |
|--------|--------|-----------|------------------|
| **Flutterwave** | Required | ✅ Automatic | ❌ Not needed |
| **Binance** | Optional | ❌ Manual | ✅ In Admin Panel |
| **Bybit USDT** | Optional | ❌ Manual | ✅ In Admin Panel |

---

## 📧 Email Notifications

When you confirm a manual payment:
- ✅ User gets email confirming their payment
- ✅ User gets login credentials for their trading account
- ✅ User can immediately start trading

---

## 🎓 Next Steps

1. **Gather your credentials:**
   - Resend API key ✅ (Already configured)
   - Flutterwave keys ✅ (Already configured)
   - Binance Merchant ID (if using)
   - Bybit wallet address (if using)

2. **Update your `.env` file** with the credentials

3. **Test the system:**
   - Create a test payment
   - Confirm it in the admin dashboard
   - Verify the user receives an email

4. **Go live!** Your payment system is ready

---

## ❓ FAQ

**Q: Do I need both Binance and Bybit?**
A: No! Set up only what you want. Users will see the available payment methods in checkout.

**Q: What if I forget to confirm a payment?**
A: No problem. Go to Admin → Payments → Manual Confirmation and confirm it anytime. The email will still be sent.

**Q: Can I change payment methods later?**
A: Yes! Update your `.env` file anytime. Changes take effect immediately after restarting the app.

**Q: Is Flutterwave still available?**
A: Yes! Flutterwave payments are automatic. Manual confirmation is only for Binance & Bybit.

**Q: Can users see these are manual payments?**
A: Yes, checkout shows which methods are available. They'll see your Merchant ID for Binance or wallet address for Bybit.

---

## 🛠️ Troubleshooting

**Payment not appearing in admin?**
- Check that the payment transaction actually completed
- Verify the correct email address was used

**Email not sending after confirmation?**
- Make sure Resend API key is correct in `.env`
- Check that EMAIL_FROM is verified in Resend dashboard

**Can't find transaction hash for Bybit?**
- Visit https://tronscan.org
- Paste your wallet address
- Find the transaction in the list
- Click it to see the full TXID

---

## 📞 Support

If you need help:
1. Check the Admin Dashboard → Payments section
2. Review transaction logs for details
3. Verify all `.env` variables are set correctly

**You're all set! Your payment system is ready to go. 🎉**
