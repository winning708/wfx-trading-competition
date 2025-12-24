# WFX Trading Competition - Setup Guide for Nigeria

This guide walks you through setting up email and payment services optimized for Nigeria.

---

## 1. Email Service - Resend (Works in Nigeria! ✅)

Resend is the best free alternative to SendGrid for Nigeria.

### Step 1: Create Resend Account
1. Go to [Resend.com](https://resend.com)
2. Click **Sign Up**
3. Sign up with your email
4. Verify your email

### Step 2: Get API Key
1. Log in to Resend dashboard
2. Go to **API Keys** (left sidebar)
3. Click **Create API Key**
4. Copy the key (starts with `re_`)

### Step 3: Verify Sender Email
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain** OR **Add Email**
3. If using your domain:
   - Add domain
   - Follow DNS setup instructions
4. If using email:
   - Verify email address
   - You'll get a verification link

### Step 4: Add to .env
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourcompany.com
```

### ✅ Free Tier Limits
- 100 emails per day
- Perfect for testing/small scale
- Paid plans available when you scale

---

## 2. Payment - Flutterwave (Nigerian Company! ✅)

Flutterwave is perfect for Nigeria with multiple payment options.

### Step 1: Create Flutterwave Account
1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Click **Sign Up**
3. Enter email, create password
4. Verify email
5. Complete business setup

### Step 2: Complete Your Profile
1. Go to **Settings → Business Information**
2. Fill in:
   - Business name
   - Business type
   - Country (Nigeria)
   - Phone number

### Step 3: KYC Verification
1. Go to **Settings → Compliance**
2. Upload required documents:
   - ID (Passport/Driver License/NIN)
   - Business registration (if applicable)
3. Wait for approval (usually 24-48 hours)

### Step 4: Get API Keys
1. Go to **Settings → API**
2. Under "Development":
   - Copy **Public Key** (starts with `FLWPUBK_`)
   - Copy **Secret Key** (starts with `FLWSECK_`)

### Step 5: Set Up Webhook
1. Go to **Settings → Webhooks**
2. Click **Add New**
3. Webhook URL: `https://yourdomain.com/api/payment/webhooks/flutterwave`
4. Select events: `charge.completed`
5. Copy the **Secret Hash**

### Step 6: Add to .env
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_hash
```

### ✅ Flutterwave Payment Methods Available
- 💳 **Cards**: Visa, Mastercard, American Express
- 📱 **Mobile Money**: MTN, Airtel, GLO, Etisalat
- 🏦 **Bank Transfer**: All Nigerian banks
- 💰 **USSD**: Quick dial transfer
- 📲 **Bulk SMS**: Coming soon

### ✅ Settlement
- Payouts within 24 hours
- Direct to Nigerian bank account
- Low transaction fees (1.4% - 1.5%)

---

## 3. Payment - Binance Pay (Optional)

Binance accepts crypto payments from Nigeria.

### Step 1: Create Binance Account
1. Go to [Binance.com](https://binance.com)
2. Create account
3. Complete 2FA setup
4. KYC verification (required for merchants)

### Step 2: Access Merchant Dashboard
1. Log in to Binance
2. Go to **Binance Pay** (top menu)
3. Click **For Merchants**
4. Complete merchant setup

### Step 3: Get Credentials
1. In Merchant Dashboard:
   - Go to **API Credentials**
   - Create new API key
   - Copy: **API Key**, **Secret Key**
   - Go to **Settings**: Copy **Merchant ID**

### Step 4: Set Up Webhook
1. Go to **Webhooks** in merchant dashboard
2. Add endpoint: `https://yourdomain.com/api/payment/webhooks/binance`
3. Copy webhook secret

### Step 5: Add to .env
```env
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_WEBHOOK_SECRET=your_webhook_secret
```

### ✅ Binance Payment Methods
- 🪙 USDT (Tether) - Stable coin
- 🪙 BUSD (Binance USD) - Stable coin
- 🪙 USDC (USD Coin) - Stable coin

---

## 4. Payment - Bybit (Optional)

Bybit also accepts crypto from Nigeria.

### Step 1: Create Bybit Account
1. Go to [Bybit.com](https://bybit.com)
2. Sign up
3. Complete email verification
4. Enable 2FA

### Step 2: Access Merchant Platform
1. Log in to Bybit
2. Go to **Bybit Pay** (main menu)
3. Click **Merchant Platform**
4. Complete merchant registration

### Step 3: Get Credentials
1. In Merchant Dashboard:
   - Go to **Settings → API Credentials**
   - Create API key
   - Copy: **API Key**, **Secret Key**, **Merchant ID**

### Step 4: Set Up Webhook
1. Go to **Webhook Management**
2. Add: `https://yourdomain.com/api/payment/webhooks/bybit`
3. Copy webhook secret

### Step 5: Add to .env
```env
BYBIT_API_KEY=your_api_key
BYBIT_SECRET_KEY=your_secret_key
BYBIT_MERCHANT_ID=your_merchant_id
BYBIT_WEBHOOK_SECRET=your_webhook_secret
```

### ✅ Bybit Payment Methods
- 🪙 USDT - Tether (Most popular)
- 🪙 ETH - Ethereum

---

## Complete .env File for Nigeria

```env
# ============================================
# SUPABASE
# ============================================
VITE_SUPABASE_URL=https://cujdemfiikeoamryjwza.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ============================================
# EMAIL (Resend - Works in Nigeria!)
# ============================================
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@wfxtrading.com

# ============================================
# PAYMENT - FLUTTERWAVE (Recommended for Nigeria)
# ============================================
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_hash

# ============================================
# PAYMENT - BINANCE PAY (Optional - Crypto)
# ============================================
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# PAYMENT - BYBIT (Optional - Crypto)
# ============================================
BYBIT_API_KEY=your_api_key
BYBIT_SECRET_KEY=your_secret_key
BYBIT_MERCHANT_ID=your_merchant_id
BYBIT_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# BACKEND
# ============================================
BACKEND_URL=https://yourdomain.com
```

---

## Testing the Setup

### 1. Test Email
```bash
curl -X POST http://localhost:3000/api/email/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "fullName": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Confirmation email sent"
}
```

### 2. Test Payment (Flutterwave)
```bash
curl -X POST http://localhost:3000/api/payment/initiate/flutterwave \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "amount": 15
  }'
```

### 3. Test Webhook Reception
Use [webhook.site](https://webhook.site):
1. Go to https://webhook.site
2. Copy your unique URL
3. Update payment provider webhook to point to your webhook.site URL
4. Make a test transaction
5. See webhook data in real-time

---

## Recommended Setup Strategy

### Option 1: **Simple** (Email + Flutterwave)
- ✅ Easiest to set up
- ✅ Best for Nigeria market
- ✅ Covers: Cards, Mobile Money, Bank Transfer
- **Setup time**: 1-2 hours

Required environment variables:
```env
RESEND_API_KEY=...
EMAIL_FROM=...
FLUTTERWAVE_PUBLIC_KEY=...
FLUTTERWAVE_SECRET_KEY=...
FLUTTERWAVE_SECRET_HASH=...
BACKEND_URL=...
```

### Option 2: **Complete** (Email + All Payment Methods)
- ✅ Maximum flexibility
- ✅ Users can choose payment method
- ✅ Crypto options for international users
- **Setup time**: 3-4 hours

Requires all environment variables from above

---

## Troubleshooting

### Email Not Sending
**Problem**: "Resend API key not configured"
- Check `RESEND_API_KEY` is in `.env`
- Verify API key starts with `re_`

**Problem**: "Invalid sender email"
- Verify sender email is confirmed in Resend dashboard
- Use verified domain if available

### Flutterwave Issues

**Problem**: "Payment not configured"
- Verify `FLUTTERWAVE_PUBLIC_KEY` and `FLUTTERWAVE_SECRET_KEY` in `.env`
- Ensure account is KYC verified

**Problem**: Webhook not triggering
- Verify webhook URL is publicly accessible
- Check it ends with `/api/payment/webhooks/flutterwave`
- Test with webhook.site first

**Problem**: "Invalid signature"
- Verify `FLUTTERWAVE_SECRET_HASH` matches exactly
- Don't use test/production keys mixed up

### Binance/Bybit Issues

**Problem**: Webhook verification fails
- Ensure webhook secret is correct
- Check webhook URL is exactly right
- Test with webhook.site

---

## Support & Resources

### Resend
- Docs: https://resend.com/docs
- Support: support@resend.com
- Status: https://resend.com/status

### Flutterwave
- Docs: https://developer.flutterwave.com
- Support: support@flutterwave.com
- Help Center: https://support.flutterwave.com

### Binance Pay
- Docs: https://pay.binance.com/en/api-docs
- Support: merchantsupport@binance.com

### Bybit
- Docs: https://pay.bybit.com/docs
- Support: merchant_support@bybit.com

---

## Next Steps

1. ✅ Sign up for Resend (5 minutes)
2. ✅ Get Resend API key and add to `.env`
3. ✅ Sign up for Flutterwave (10 minutes)
4. ✅ Complete KYC verification (24-48 hours)
5. ✅ Get Flutterwave keys and add to `.env`
6. ✅ Set webhook URL in Flutterwave
7. ✅ Test email sending
8. ✅ Test payment flow
9. ✅ Deploy and go live!

