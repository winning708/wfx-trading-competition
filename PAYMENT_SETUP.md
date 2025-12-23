# Payment Integration Setup Guide

This guide explains how to set up payment processing with **Flutterwave**, **Binance Pay**, and **Bybit** for the WFX Trading Competition registration.

## Overview

The payment system is fully integrated with:
- ✅ Payment initiation endpoints
- ✅ Webhook handlers for payment confirmation
- ✅ Automatic registration completion
- ✅ Confirmation email sending
- ✅ Email receipts

You only need to configure your API credentials!

## Prerequisites

- SendGrid account (for emails)
- Flutterwave account (for cards, mobile money, bank transfer)
- Binance account (for cryptocurrency payments)
- Bybit account (for TRC20 crypto payments)

---

## 1. SetUp SendGrid (Email Service)

SendGrid will handle sending confirmation and receipt emails to traders.

### Get SendGrid API Key

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up or log in
3. Go to **Settings** → **API Keys** (left sidebar)
4. Click **Create API Key**
5. Name it: `WFX_Trading_Competition`
6. Select **Full Access** or customize permissions for Mail Send
7. Copy the API key (starts with `SG.`)

### Add SendGrid Email

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain** or **Verify a Single Sender**
3. Add your email: `noreply@wfxtrading.com` (or your domain)
4. Verify it

### Environment Variables

Add these to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@wfxtrading.com
```

---

## 2. Flutterwave Setup (Cards, Mobile Money, Bank Transfer)

Flutterwave handles African payment methods and international cards.

### Get Flutterwave Credentials

1. Go to [Flutterwave.com](https://flutterwave.com)
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. You'll see:
   - **Public Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)
5. Also get the **Secret Hash** from Settings → **Webhook** section

### Set Up Webhook

1. In Flutterwave dashboard, go to **Settings** → **Webhooks**
2. Set webhook URL to:
   ```
   https://yourdomain.com/api/payment/webhooks/flutterwave
   ```
3. Select events: **Charge Completed** (and optionally **Charge Failed**)
4. Copy the **Secret Hash**

### Test Mode vs Live Mode

- **Test**: Use `pk_test_` and `sk_test_` keys (no real charges)
- **Live**: Use `pk_live_` and `sk_live_` keys (real charges)

### Environment Variables

Add these to your `.env` file:

```bash
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx  # or pk_live_
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx  # or sk_live_
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash
```

---

## 3. Binance Pay Setup (USDT, BNB, etc.)

Binance Pay handles cryptocurrency payments (recommended for crypto users).

### Get Binance Pay Credentials

1. Log in to [Binance.com](https://binance.com)
2. Go to **Business** → **Binance Pay**
3. Complete merchant identity verification (KYC)
4. Create an API key:
   - Go to **Merchant Dashboard** → **API Management**
   - Click **Create New Key**
   - Enable: **Binance Pay**
5. You'll get:
   - **Merchant ID**
   - **API Key**
   - **Secret Key**

### Set Up Webhook

1. In Binance Pay dashboard, go to **Webhooks**
2. Add webhook URL:
   ```
   https://yourdomain.com/api/payment/webhooks/binance
   ```
3. Select event type: **Payment Success**
4. Binance will send a signature header for verification

### Environment Variables

Add these to your `.env` file:

```bash
# Binance Pay Configuration
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
```

---

## 4. Bybit Setup (TRC20 Crypto)

Bybit specializes in USDT (TRC20) and is great for crypto-native users.

### Get Bybit Credentials

1. Go to [Bybit.com](https://bybit.com)
2. Create an account or sign in
3. Go to **Account** → **API**
4. Click **Create API**
5. Name: `WFX Trading Competition`
6. Select permissions: **Read, Write**
7. You'll get:
   - **API Key** (starts with random characters)
   - **Secret Key** (starts with random characters)

### Set Up Webhook

1. In Bybit API Management, go to **Webhooks**
2. Add webhook URL:
   ```
   https://yourdomain.com/api/payment/webhooks/bybit
   ```
3. Subscribe to: **Order Status Changed**
4. Select: **SUCCESS** status only

### Environment Variables

Add these to your `.env` file:

```bash
# Bybit Configuration
BYBIT_MERCHANT_ID=your_merchant_id
BYBIT_API_KEY=your_api_key
BYBIT_SECRET_KEY=your_secret_key
```

---

## Complete Environment Variables

Here's your complete `.env` file template:

```bash
# ========== Supabase ==========
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ========== Email (SendGrid) ==========
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@wfxtrading.com

# ========== Flutterwave ==========
FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxx
FLUTTERWAVE_SECRET_HASH=xxxxx

# ========== Binance Pay ==========
BINANCE_MERCHANT_ID=xxxxx
BINANCE_API_KEY=xxxxx
BINANCE_SECRET_KEY=xxxxx

# ========== Bybit ==========
BYBIT_MERCHANT_ID=xxxxx
BYBIT_API_KEY=xxxxx
BYBIT_SECRET_KEY=xxxxx

# ========== Application ==========
BACKEND_URL=https://yourdomain.com
```

---

## Integration Flow

### 1. User Registers

User fills registration form (Name, Email, Phone, Country)

### 2. User Selects Payment Method

User chooses: Flutterwave, Binance Pay, or Bybit

### 3. Backend Initiates Payment

Frontend calls:
```
POST /api/payment/initiate/{method}
```

Backend returns payment details for the payment processor

### 4. User Completes Payment

User is redirected to payment processor's page (Flutterwave, Binance, Bybit)

### 5. Payment Webhook

Payment processor sends webhook to:
```
POST /api/payment/webhooks/{method}
```

Backend verifies signature and processes payment

### 6. Auto-Confirmation

When webhook received:
- ✅ Trader status updated to `entry_fee_paid: true`
- ✅ Confirmation email sent
- ✅ Receipt email sent
- ✅ Registration complete!

---

## Testing Payments

### Flutterwave Test Mode

1. Use `pk_test_` and `sk_test_` keys (already in .env)
2. Use test card: **4242 4242 4242 4242**
3. Any future expiry date
4. Any 3-digit CVC

### Binance Pay Test Mode

1. Contact Binance support for test API keys
2. Test with small amounts (0.01 USDT)

### Bybit Test Mode

1. Use testnet API keys from Bybit dashboard
2. Test with small amounts

---

## Webhook Security

All webhooks verify signatures to ensure requests from legitimate payment processors:

- **Flutterwave**: HMAC-SHA256 signature
- **Binance**: HMAC-SHA256 signature  
- **Bybit**: HMAC-SHA256 signature

Signature verification happens automatically. Invalid signatures are rejected with 401 Unauthorized.

---

## Troubleshooting

### Emails Not Sending

**Check:**
1. SendGrid API key is correct
2. Sender email is verified in SendGrid
3. Check SendGrid activity logs for errors
4. Check server logs for email-related errors

**Solution:**
```bash
# Test SendGrid manually
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...email payload...}'
```

### Webhooks Not Received

**Check:**
1. Webhook URL is publicly accessible
2. Webhook URL exactly matches payment processor settings
3. Firewall isn't blocking payment processor IP ranges
4. Check payment processor logs for webhook delivery status

**Solution:**
```bash
# Test webhook manually
curl -X POST https://yourdomain.com/api/payment/webhooks/flutterwave \
  -H "verificationhash: your_hash" \
  -H "Content-Type: application/json" \
  -d '{...payment data...}'
```

### Payment Not Updating Trader

**Check:**
1. Email in payment matches registration email exactly
2. Trader exists in database with that email
3. Check server logs for error messages
4. Verify signature is correct

**Solution:**
Enable debug logging and check:
```bash
tail -f logs/server.log | grep "Payment"
```

---

## API Endpoints Reference

### Initiate Payment

```bash
POST /api/payment/initiate/flutterwave
POST /api/payment/initiate/binance
POST /api/payment/initiate/bybit

Body: {
  "email": "user@example.com",
  "amount": 15,
  "fullName": "User Name"
}

Response: {
  "success": true,
  "paymentData": {
    // Payment processor specific data
  }
}
```

### Webhooks (Payment Processors Call These)

```bash
POST /api/payment/webhooks/flutterwave
POST /api/payment/webhooks/binance
POST /api/payment/webhooks/bybit
```

### Send Email

```bash
POST /api/email/send-confirmation
Body: {
  "email": "user@example.com",
  "fullName": "User Name"
}

POST /api/email/send-receipt
Body: {
  "email": "user@example.com",
  "fullName": "User Name",
  "amount": 15,
  "paymentMethod": "flutterwave",
  "transactionId": "txn_123456"
}
```

---

## Production Checklist

Before going live:

- [ ] Switch all keys from test to live (pk_test_ → pk_live_, etc.)
- [ ] Set `BACKEND_URL` to your production domain
- [ ] Update webhook URLs in all payment processors to production
- [ ] Test full payment flow with real transactions (small amounts)
- [ ] Set up email warmup with SendGrid (start with 100/day, increase)
- [ ] Configure SSL certificate
- [ ] Set up monitoring/alerts for failed payments
- [ ] Document support process for payment issues
- [ ] Set up backup payment method if one processor fails

---

## Support

For issues with:
- **SendGrid**: [sendgrid.com/support](https://sendgrid.com/support)
- **Flutterwave**: [flutterwave.com/support](https://flutterwave.com/support)
- **Binance**: [binance.com/support](https://binance.com/support)
- **Bybit**: [bybit.com/support](https://bybit.com/support)

---

**Last Updated**: 2025
**Version**: 1.0
