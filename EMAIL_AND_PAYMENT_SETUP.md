# Email and Payment Setup Guide

This guide walks you through setting up all email and payment services for the WFX Trading Competition platform.

## 1. Email Service - SendGrid

### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account
3. Complete email verification

### Step 2: Get API Key
1. Navigate to **Settings → API Keys**
2. Click **Create API Key**
3. Name it: `WFX Trading API`
4. Select **Full Access**
5. Copy the key

### Step 3: Get Sender Email
1. Navigate to **Settings → Sender Authentication**
2. Verify a domain or single sender email
3. Use verified email as `SENDGRID_FROM_EMAIL`

### Step 4: Environment Variables
Add to your `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
```

---

## 2. Payment - Flutterwave

### Step 1: Create Flutterwave Account
1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Sign up for a business account
3. Verify your email and phone

### Step 2: Get API Keys
1. Navigate to **Settings → API**
2. Copy:
   - **Public Key** (starts with `FLWPUBK_`)
   - **Secret Key** (starts with `FLWSECK_`)

### Step 3: Set Up Webhook
1. Go to **Settings → Webhooks**
2. Add webhook URL:
   ```
   https://yourdomain.com/api/payment/webhooks/flutterwave
   ```
3. Enable events: `charge.completed`
4. Copy the **Secret Hash** from webhook settings

### Step 4: Environment Variables
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash
BACKEND_URL=https://yourdomain.com
```

### Step 5: Payment Setup
- Amount: $15 USD
- Currency: USD
- Supports: Cards, Mobile Money, Bank Transfer

---

## 3. Payment - Binance Pay

### Step 1: Create Binance Business Account
1. Go to [Binance Pay](https://pay.binance.com)
2. Sign up for business account
3. Complete KYC verification

### Step 2: Get Merchant Credentials
1. Navigate to **Merchant Dashboard**
2. Go to **API Credentials**
3. Create new API key
4. Copy:
   - **API Key**
   - **Secret Key**
   - **Merchant ID**

### Step 3: Set Up Webhook
1. Go to **Webhook Settings**
2. Add endpoint:
   ```
   https://yourdomain.com/api/payment/webhooks/binance
   ```
3. Copy the webhook secret

### Step 4: Environment Variables
```env
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_WEBHOOK_SECRET=your_webhook_secret
```

### Step 5: Payment Setup
- Amount: $15 USD (or equivalent in USDT/BUSD)
- Currency: Accepts crypto payments

---

## 4. Payment - Bybit

### Step 1: Create Bybit Account
1. Go to [Bybit Pay](https://merchant.bybit.com)
2. Sign up for merchant account
3. Complete verification

### Step 2: Get Merchant Credentials
1. Navigate to **Settings → API**
2. Create new key
3. Copy:
   - **API Key**
   - **Secret Key**
   - **Merchant ID**

### Step 3: Set Up Webhook
1. Go to **Webhook Management**
2. Add webhook:
   ```
   https://yourdomain.com/api/payment/webhooks/bybit
   ```
3. Copy webhook secret

### Step 4: Environment Variables
```env
BYBIT_API_KEY=your_bybit_api_key
BYBIT_SECRET_KEY=your_bybit_secret_key
BYBIT_MERCHANT_ID=your_merchant_id
BYBIT_WEBHOOK_SECRET=your_webhook_secret
```

### Step 5: Payment Setup
- Amount: $15 USD (or equivalent)
- Currency: Accepts crypto payments

---

## Complete .env File Template

```env
# Supabase
VITE_SUPABASE_URL=https://cujdemfiikeoamryjwza.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@wfxtrading.com

# Payment - Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_hash

# Payment - Binance Pay
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_WEBHOOK_SECRET=your_webhook_secret

# Payment - Bybit
BYBIT_API_KEY=your_api_key
BYBIT_SECRET_KEY=your_secret_key
BYBIT_MERCHANT_ID=your_merchant_id
BYBIT_WEBHOOK_SECRET=your_webhook_secret

# Backend Configuration
BACKEND_URL=https://yourdomain.com
```

---

## Testing the Setup

### Test Email Sending
```bash
curl -X POST http://localhost:3000/api/email/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User"
  }'
```

### Test Payment Initiation
```bash
curl -X POST http://localhost:3000/api/payment/initiate/flutterwave \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "amount": 15
  }'
```

---

## Payment Flow Summary

1. **User enters registration form** → Personal details captured
2. **User selects payment method** → Choose Flutterwave, Binance, or Bybit
3. **Backend initiates payment** → Returns payment data to frontend
4. **User completes payment** → Redirected to payment provider
5. **Payment provider processes** → Webhook sent to backend
6. **Backend receives webhook** → Updates payment status
7. **Confirmation email sent** → User receives confirmation
8. **Credentials assigned** → First available credential given to user
9. **Credentials email sent** → User receives trading account details
10. **User redirected** → Taken to leaderboard

---

## Webhook Testing

You can test webhooks locally using:
- [Webhook.site](https://webhook.site) - Free webhook testing
- [RequestBin](https://requestbin.com) - Capture and inspect webhooks
- Ngrok - Expose local server to internet

---

## Troubleshooting

### Email Not Sending
- Verify `SENDGRID_API_KEY` is correct
- Check `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Check server logs for SendGrid errors

### Payments Not Processing
- Verify webhook URLs are correct and accessible
- Check that secret keys/hashes match
- Test with provider's test keys first
- Check payment webhook logs in provider dashboard

### Webhook Not Triggering
- Verify endpoint URL is publicly accessible
- Check firewall/security group allows HTTPS (443)
- Verify correct HTTP method (POST)
- Check provider's webhook logs

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Keep all secret keys private
- Rotate API keys regularly
- Use strong webhookSecrets
- Always verify webhook signatures
- Use HTTPS only for production

