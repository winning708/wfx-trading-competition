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

## 🔗 BINANCE PAY (Optional - Crypto Payments)

**Status:** ⚪ OPTIONAL - Only if you want crypto payments

### How to Get It:
1. Go to https://pay.binance.com
2. Merchant Dashboard → API Management
3. Create an API Key
4. Copy API Key and Secret Key

### Paste Here:
```
BINANCE_API_KEY=[PASTE_YOUR_BINANCE_API_KEY_HERE]
BINANCE_SECRET_KEY=[PASTE_YOUR_BINANCE_SECRET_KEY_HERE]
BINANCE_MERCHANT_ID=[PASTE_YOUR_MERCHANT_ID_HERE]
BINANCE_WEBHOOK_SECRET=[PASTE_YOUR_WEBHOOK_SECRET_HERE]
```

---

## 🟡 BYBIT (Optional - Crypto Payments)

**Status:** ⚪ OPTIONAL - Only if you want crypto payments

### How to Get It:
1. Go to https://merchant.bybit.com
2. API Management → Create API Key
3. Webhook Management → Copy Webhook Secret

### Paste Here:
```
BYBIT_API_KEY=[PASTE_YOUR_BYBIT_API_KEY_HERE]
BYBIT_SECRET_KEY=[PASTE_YOUR_BYBIT_SECRET_KEY_HERE]
BYBIT_MERCHANT_ID=[PASTE_YOUR_MERCHANT_ID_HERE]
BYBIT_WEBHOOK_SECRET=[PASTE_YOUR_WEBHOOK_SECRET_HERE]
```

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

- [ ] **Resend** - API key pasted above
- [ ] **Flutterwave** - All 3 keys pasted above
- [ ] (Optional) **Binance** - All keys pasted
- [ ] (Optional) **Bybit** - All keys pasted

---

## 📝 Next Steps

Once you've pasted all your API keys above:

1. **Tell me when you're done** - I'll move them to the actual system
2. **We'll test the email** - Send a test email via Resend
3. **We'll test payments** - Test the payment flow with Flutterwave
4. **Go live** - Deploy to production!

---

**⚠️ SECURITY NOTE:** Never commit this file to GitHub! The actual `.env` file is in `.gitignore` so it's safe, but this `API_KEYS.md` file is for your reference only.
