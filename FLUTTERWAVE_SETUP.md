# Flutterwave Setup Guide for WFX Trading Competition

## Overview

Flutterwave is a payment processor that allows you to accept payments from multiple channels:
- 💳 Credit/Debit Cards (Visa, Mastercard)
- 📱 Mobile Money (African operators)
- 🏦 Bank Transfers (Direct bank payments)
- ⚡ USSD (Unstructured Supplementary Service Data)
- 🌐 International payments

This guide walks you through getting your Flutterwave account set up and connected to the WFX Trading Competition platform.

---

## Step 1: Create Your Flutterwave Account

### 1.1 Sign Up

1. Go to **[Flutterwave.com](https://flutterwave.com)**
2. Click **"Get Started"** or **"Sign Up"** (top right)
3. Choose your account type: **Business**
4. Fill in:
   - **Business Name**: `WFX Trading` (or your company name)
   - **Business Email**: Your business email (e.g., `admin@wfxtrading.com`)
   - **Password**: Create a strong password
   - **Country**: Select your country
5. Click **"Create Account"**

### 1.2 Verify Your Email

1. Check the email you provided (might be in spam)
2. Click the verification link
3. You'll be redirected to complete your profile

### 1.3 Complete Your Business Profile

Once logged in, you'll see the dashboard. Complete these sections:

1. **Go to Settings** (usually bottom-left menu)
2. **Business Information**:
   - Business Name: `WFX Trading Competition 2026`
   - Business Address: Your physical business address
   - Business Phone: Your phone number
   - Industry: Select **"Financial Services"** or **"Trading"**

3. **Bank Account Details** (for payouts)
   - Add your bank account where payments will be deposited
   - Flutterwave will verify this

---

## Step 2: Get Your API Credentials

### 2.1 Navigate to API Keys

1. In your Flutterwave dashboard, go to **Settings** → **API & Webhooks**
2. You'll see two sections:
   - **Live Keys** (for real payments)
   - **Test Keys** (for testing before going live)

### 2.2 Get Your Keys

**For Testing** (start here):
1. Under **"Test Keys"** section, you'll see:
   - **Public Key**: Starts with `pk_test_...`
   - **Secret Key**: Starts with `sk_test_...`

Copy both values.

**For Production** (after testing):
1. Under **"Live Keys"** section, you'll see:
   - **Public Key**: Starts with `pk_live_...`
   - **Secret Key**: Starts with `sk_live_...`

⚠️ **Important**: Never share your **Secret Key**. It's like a password to your account!

### 2.3 Get Your Webhook Secret Hash

1. Still in **Settings** → **API & Webhooks**
2. Look for **"Webhook Secret Hash"** section
3. You should see a hash value (something like `flw_webhook_xxxxxxxxxxx`)
4. Copy this value - you'll need it for webhook verification

---

## Step 3: Add Webhook Endpoint

### 3.1 Configure Webhook URL

Webhooks are how Flutterwave tells your platform when a payment is successful.

1. In **Settings** → **API & Webhooks**
2. Look for **"Webhook URL"** field
3. Enter your webhook endpoint:
   ```
   https://yourdomain.com/api/payment/webhooks/flutterwave
   ```
   Replace `yourdomain.com` with your actual domain (e.g., `wfxtrading.com`)

4. Make sure **"Webhook Active"** is toggled **ON**
5. Click **Save**

### 3.2 Test Webhook

1. Flutterwave provides a **"Send Test Webhook"** button
2. Click it to send a test webhook to your endpoint
3. Check your server logs to see if it was received

---

## Step 4: Configure Environment Variables

Now you need to add your credentials to your `.env` file so your platform can use them.

### 4.1 Update Your .env File

Open your `.env` file and add these lines:

```bash
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_HASH=flw_webhook_xxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_REDIRECT_URL=https://yourdomain.com/payment/success?method=flutterwave

# For Production (after testing), replace with:
# FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
# FLUTTERWAVE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
```

Replace:
- `pk_test_...` with your **Public Key**
- `sk_test_...` with your **Secret Key**
- `flw_webhook_...` with your **Webhook Secret Hash**
- `yourdomain.com` with your actual domain

### 4.2 Restart Your Server

After updating `.env`, restart your application so the new environment variables are loaded:

```bash
npm run dev
```

---

## Step 5: Test the Payment Flow

### 5.1 Create a Test Payment

1. Go to your registration page (e.g., `https://yourdomain.com/register`)
2. Fill in trader details
3. When prompted for payment, select **"Flutterwave"**
4. You'll be redirected to Flutterwave's payment page

### 5.2 Use Test Card Details

Flutterwave provides test cards. Use these:

**Successful Payment:**
```
Card Number: 4187 2727 3200 3011
Expiry: 09/32
CVV: 812
```

**Failed Payment:**
```
Card Number: 5399 8400 0000 0005
Expiry: 09/32
CVV: 812
```

### 5.3 Verify Payment

1. Complete the payment flow
2. You should be redirected to a success page
3. Check your Flutterwave dashboard:
   - Go to **Transactions** → **Payments**
   - Your test payment should appear
4. Check your admin panel:
   - Go to **Admin** → **Payments**
   - Your transaction should be logged

---

## Step 6: Go Live

Once you've tested thoroughly:

### 6.1 Switch to Live Keys

1. In your Flutterwave dashboard, get your **Live Keys** (not test keys)
2. Update your `.env` file:
   ```bash
   FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
   FLUTTERWAVE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
   ```

### 6.2 Update Webhook URL (if domain changed)

1. Go back to **Settings** → **API & Webhooks**
2. Update the webhook URL if you have a different domain for production:
   ```
   https://wfxtrading.com/api/payment/webhooks/flutterwave
   ```

### 6.3 Test with Real Payment (Optional)

Make a small real payment to verify everything works with live credentials.

---

## Troubleshooting

### Payment Not Appearing in Dashboard

**Problem**: You completed a payment but it's not showing in your admin panel.

**Solutions**:
1. Check that the webhook endpoint is correct
2. Verify the webhook is active in Flutterwave settings
3. Check your server logs for webhook errors
4. Ensure `FLUTTERWAVE_SECRET_HASH` matches the one in Flutterwave

### Webhook Signature Invalid

**Problem**: You see "Invalid signature" errors in logs.

**Solutions**:
1. Copy the webhook secret hash exactly (no extra spaces)
2. Verify it matches in your `.env` file
3. Sometimes Flutterwave rotates keys - get a fresh copy

### Payment Redirects But No Confirmation Email

**Problem**: Payment succeeded but user didn't receive confirmation email.

**Solutions**:
1. Check SendGrid is configured (see `PAYMENT_SETUP.md`)
2. Verify `SENDGRID_API_KEY` is set
3. Check spam/junk folder
4. View email logs in your admin panel

### Test Mode vs Live Mode

**Symptom**: Works in test mode but not in live mode.

**Solutions**:
1. Ensure you're using **Live Keys** (pk_live_, not pk_test_)
2. Verify webhook URL is the production domain (not localhost)
3. Test with a small amount first
4. Check transaction limits in your Flutterwave account settings

---

## Security Best Practices

1. **Never commit `.env`**: Keep environment variables out of git
2. **Rotate keys regularly**: Change your API keys every 6 months
3. **Use HTTPS**: Always use https:// for webhook URLs
4. **Validate requests**: The platform validates all webhook signatures
5. **Log transactions**: Keep logs of all payment transactions for auditing

---

## Next Steps

- Set up **Binance Pay** for cryptocurrency payments (see `BINANCE_PAY_SETUP.md`)
- Set up **Bybit** for TRC20 crypto payments (see `BYBIT_SETUP.md`)
- Configure **Payment Monitoring Dashboard** in your admin panel
- Set up **Failed Payment Alerts** to be notified of issues

---

## Support

- **Flutterwave Docs**: https://developer.flutterwave.com/docs
- **Flutterwave Support**: https://support.flutterwave.com
- **WFX Support**: Contact your admin

---

## Summary

Your credentials are now set up! Here's what happens when a trader pays:

1. 🧑 **Trader** clicks "Register & Pay"
2. 💳 **Flutterwave** processes their payment
3. 🔐 **Webhook** notifies your platform of success
4. ✅ **Automatic Confirmation** - trader is marked as paid
5. 📧 **Email** is sent with receipt and confirmation
6. 📊 **Dashboard** logs the transaction for monitoring
