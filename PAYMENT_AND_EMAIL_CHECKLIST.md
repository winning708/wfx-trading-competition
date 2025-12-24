# Payment & Email Setup Checklist

## Quick Setup Checklist

### ✅ Email (SendGrid)
- [ ] Create SendGrid account
- [ ] Get API Key
- [ ] Verify sender email
- [ ] Set environment variables:
  - [ ] `SENDGRID_API_KEY`
  - [ ] `SENDGRID_FROM_EMAIL`
- [ ] Test with: `curl -X POST http://localhost:3000/api/email/send-confirmation ...`

### ✅ Flutterwave
- [ ] Create Flutterwave merchant account
- [ ] Get Public Key (`FLWPUBK_...`)
- [ ] Get Secret Key (`FLWSECK_...`)
- [ ] Set webhook to: `https://yourdomain.com/api/payment/webhooks/flutterwave`
- [ ] Get webhook secret hash
- [ ] Set environment variables:
  - [ ] `FLUTTERWAVE_PUBLIC_KEY`
  - [ ] `FLUTTERWAVE_SECRET_KEY`
  - [ ] `FLUTTERWAVE_SECRET_HASH`
  - [ ] `BACKEND_URL`
- [ ] Test payment flow

### ✅ Binance Pay (Optional)
- [ ] Create Binance business account
- [ ] Get API Key
- [ ] Get Secret Key
- [ ] Get Merchant ID
- [ ] Set webhook to: `https://yourdomain.com/api/payment/webhooks/binance`
- [ ] Get webhook secret
- [ ] Set environment variables:
  - [ ] `BINANCE_API_KEY`
  - [ ] `BINANCE_SECRET_KEY`
  - [ ] `BINANCE_MERCHANT_ID`
  - [ ] `BINANCE_WEBHOOK_SECRET`
- [ ] Test payment flow

### ✅ Bybit (Optional)
- [ ] Create Bybit merchant account
- [ ] Get API Key
- [ ] Get Secret Key
- [ ] Get Merchant ID
- [ ] Set webhook to: `https://yourdomain.com/api/payment/webhooks/bybit`
- [ ] Get webhook secret
- [ ] Set environment variables:
  - [ ] `BYBIT_API_KEY`
  - [ ] `BYBIT_SECRET_KEY`
  - [ ] `BYBIT_MERCHANT_ID`
  - [ ] `BYBIT_WEBHOOK_SECRET`
- [ ] Test payment flow

---

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User Registration
   ├─ Full Name, Email, Phone, Country
   └─ Trader registered in database

2. Payment Method Selection
   ├─ Choose: Flutterwave, Binance, or Bybit
   └─ UI shows payment option details

3. Initiate Payment
   ├─ Frontend calls: /api/payment/initiate/{method}
   ├─ Backend returns payment initialization data
   └─ Payment provider redirects to checkout

4. Payment Processing
   ├─ User completes payment on provider platform
   ├─ Provider processes transaction
   └─ Provider sends webhook to: /api/payment/webhooks/{method}

5. Backend Webhook Handler
   ├─ Verify webhook signature
   ├─ Update trader payment status
   ├─ Log payment transaction
   └─ Send confirmation email

6. Email Notification
   ├─ Confirmation email sent to trader
   ├─ Include registration details
   └─ Provide link to leaderboard

7. Credential Assignment
   ├─ Auto-assign available credential
   ├─ Create credential_assignments record
   └─ Send credentials email

8. Credentials Email
   ├─ Include: Username, Password, Account Number
   ├─ Include: Broker (JustMarkets)
   └─ Include: Setup instructions

9. User Redirected
   ├─ Success page shows confirmation
   ├─ 3-second auto-redirect to /leaderboard
   └─ User can view trading leaderboard
```

---

## Environment Variables Reference

### Required for All Setups
```env
SUPABASE_SERVICE_ROLE_KEY=your_key
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@wfxtrading.com
BACKEND_URL=https://yourdomain.com
```

### Flutterwave (Recommended)
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_...
FLUTTERWAVE_SECRET_HASH=...
```

### Binance Pay (Optional)
```env
BINANCE_API_KEY=...
BINANCE_SECRET_KEY=...
BINANCE_MERCHANT_ID=...
BINANCE_WEBHOOK_SECRET=...
```

### Bybit (Optional)
```env
BYBIT_API_KEY=...
BYBIT_SECRET_KEY=...
BYBIT_MERCHANT_ID=...
BYBIT_WEBHOOK_SECRET=...
```

---

## Testing Commands

### Test Email Service
```bash
# Test confirmation email
curl -X POST http://localhost:3000/api/email/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User"
  }'

# Expected response:
# { "success": true, "message": "Confirmation email sent" }
```

### Test Payment Initiation
```bash
# Test Flutterwave
curl -X POST http://localhost:3000/api/payment/initiate/flutterwave \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "amount": 15
  }'

# Expected response:
# { 
#   "success": true, 
#   "paymentData": { 
#     "public_key": "FLWPUBK_...",
#     "email": "test@example.com",
#     "amount": 15,
#     "currency": "USD",
#     "redirect_url": "https://yourdomain.com/api/payment/success?..."
#   }
# }
```

### Test Webhook (using webhook.site)
1. Go to https://webhook.site
2. Copy your unique URL
3. Update payment provider webhook to that URL
4. Make a test payment
5. Verify webhook is received

---

## Troubleshooting

### Email Not Sending
**Problem**: "SendGrid API key not configured"
- **Solution**: Check `SENDGRID_API_KEY` is set correctly in `.env`

**Problem**: Emails going to spam
- **Solution**: 
  - Verify sender domain in SendGrid
  - Add SPF and DKIM records
  - Use branded domain email

### Payment Not Processing
**Problem**: "Payment not configured"
- **Solution**: Check payment provider API keys are set

**Problem**: Invalid signature on webhook
- **Solution**: Verify webhook secret/hash matches exactly

**Problem**: Webhook not triggering
- **Solution**: 
  - Verify `BACKEND_URL` is publicly accessible
  - Test webhook endpoint with webhook.site first
  - Check payment provider webhook logs

---

## After Setup

### Next Steps
1. ✅ Configure all environment variables
2. ✅ Test email sending
3. ✅ Test payment initiation
4. ✅ Test webhook reception
5. ✅ Complete test registration with payment
6. ✅ Verify credential assignment
7. ✅ Verify credential email received

### Production Checklist
- [ ] Use production API keys (not test keys)
- [ ] Enable HTTPS only
- [ ] Verify all environment variables are set
- [ ] Test full payment flow end-to-end
- [ ] Monitor payment logs for errors
- [ ] Set up error alerts
- [ ] Document support contact for payment issues

