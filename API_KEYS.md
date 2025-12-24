# 🔐 API Keys & Webhooks Configuration

Paste all your API keys and webhook secrets in the sections below. This file helps you organize and store all your credentials before adding them to the system.

---

## ✅ SUPABASE (Already Configured)
These are already set up in your system:

```
VITE_SUPABASE_URL=https://cujdemfiikeoamryjwza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1amRlbWZpaWtlb2Ftcnlqd3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTE1OTEsImV4cCI6MjA4MjA2NzU5MX0.yfO_neHiPBBWx7AzYuk5sd4sIocv2BSvtkdzgmpDjC4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1amRlbWZpaWtlb2Ftcnlqd3phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5MTU5MSwiZXhwIjoyMDgyMDY3NTkxfQ.OhYhBnz05h-LmUf2-RvyjJuggSdp_HmD0siIDuoVCBk
```

---

## 📧 RESEND (Email Service)

**Status:** 🟡 PENDING - Paste your Resend API key below

### How to Get It:
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Copy the key (starts with `re_`)

### Paste Here:
```
RESEND_API_KEY=re_[PASTE_YOUR_RESEND_API_KEY_HERE]
```

### Email Sender Address:
```
EMAIL_FROM=noreply@wfxtrading.com
```

**Note:** Make sure `noreply@wfxtrading.com` is verified in your Resend dashboard

---

## 💳 FLUTTERWAVE (Nigerian Payment Gateway)

**Status:** 🟡 PENDING - Paste your Flutterwave credentials below

### How to Get It:
1. Go to https://dashboard.flutterwave.com
2. Login to your account
3. Go to **Settings → API** (left menu)
4. Copy your **Public Key** and **Secret Key**
5. Go to **Settings → Webhooks**
6. Copy your **Webhook Secret Hash**

### Paste Here:
```
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_[PASTE_YOUR_PUBLIC_KEY_HERE]
FLUTTERWAVE_SECRET_KEY=FLWSECK_[PASTE_YOUR_SECRET_KEY_HERE]
FLUTTERWAVE_SECRET_HASH=[PASTE_YOUR_WEBHOOK_SECRET_HASH_HERE]
```

---

## 🔗 BINANCE PAY (Manual Payment Method)

**Status:** ✅ OPTIONAL - Using Merchant ID only (no API needed)

### How to Get It:
1. Go to https://pay.binance.com
2. Merchant Dashboard → Copy your **Merchant ID**

### Paste Here:
```
BINANCE_MERCHANT_ID=[PASTE_YOUR_MERCHANT_ID_HERE]
```

**Note:** Users will see your Merchant ID in the checkout and can pay directly. You'll get an email notification when they complete payment.

---

## 🟡 BYBIT (Manual Payment Method - USDT)

**Status:** ✅ OPTIONAL - Using TRC-20 wallet address only (no API needed)

### How to Get It:
1. Open your Bybit wallet
2. Select **USDT** (TRC-20 network)
3. Copy your **Deposit Address**

### Paste Here:
```
BYBIT_USDT_WALLET_ADDRESS=[PASTE_YOUR_TRC20_USDT_WALLET_ADDRESS_HERE]
```

**Example:**
```
BYBIT_USDT_WALLET_ADDRESS=TBWEPBZeA2LKMRYp3FxEL8mME7VVjMUvD3
```

**Note:** Users will see your wallet address in checkout. When they send USDT to this address, you'll get an email notification with transaction details.

---

## 🚀 BACKEND CONFIGURATION

```
BACKEND_URL=http://localhost:5173
```

Change this to your production URL when deploying:
```
BACKEND_URL=https://yourdomain.com
```

---

## ✅ Checklist

- [x] **Resend** - ✅ Configured
- [x] **Flutterwave** - ✅ Configured (All 3 keys)
- [ ] (Optional) **Binance Merchant ID** - Paste your Merchant ID
- [ ] (Optional) **Bybit USDT Wallet** - Paste your TRC-20 wallet address

---

## 📝 How Manual Payments Work

### **Binance (Manual)**
1. User sees your Merchant ID in checkout
2. User pays to Binance directly (outside the platform)
3. You receive payment notification from Binance
4. You manually confirm in the admin dashboard → payment is processed

### **Bybit USDT (Manual)**
1. User sees your TRC-20 wallet address in checkout
2. User sends USDT to your wallet (on TRON network)
3. You verify the transaction on BlockScout
4. You manually confirm in the admin dashboard → payment is processed
5. **Optional:** You can provide the transaction hash for extra security

### **Flutterwave (Automated)**
- User clicks "Pay with Flutterwave"
- Payment is processed automatically
- You get instant email notification
- No manual confirmation needed ✅

---

## 📝 Next Steps

Once you've pasted all your API keys above:

1. **Update your `.env` file** with:
   - `RESEND_API_KEY` = Your Resend API key
   - `FLUTTERWAVE_PUBLIC_KEY` = Your Flutterwave public key
   - `FLUTTERWAVE_SECRET_KEY` = Your Flutterwave secret key
   - `FLUTTERWAVE_SECRET_HASH` = Your Flutterwave webhook hash
   - `BINANCE_MERCHANT_ID` = Your Binance Merchant ID (if using)
   - `BYBIT_USDT_WALLET_ADDRESS` = Your TRC-20 USDT wallet address (if using)

2. **Tell me when done** - I'll set up the admin dashboard for payment confirmation

3. **We'll test everything**:
   - Test Resend email sending
   - Test Flutterwave payments
   - Set up admin confirmation system for manual payments

4. **Go live** - Deploy to production!

---

**⚠️ SECURITY NOTE:** Never commit this file to GitHub! The actual `.env` file is in `.gitignore` so it's safe, but this `API_KEYS.md` file is for your reference only.
