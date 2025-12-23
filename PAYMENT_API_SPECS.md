# Payment Processor API Specifications

**Instructions**: Copy the API credentials from each processor and paste them in the sections below. I'll then update the code with your credentials.

---

## 1. FLUTTERWAVE API SPEC

### Webhook Signature Verification
<cite index="1-24,1-25,1-26">Flutterwave uses HMAC-SHA256 signature verification. The encrypted value is returned as `flutterwave-signature` in the header of the webhook.</cite>

```
Header: flutterwave-signature
Algorithm: HMAC-SHA256
Verification: crypto.createHmac('sha256', secretHash).update(payload).digest('base64')
```

### Webhook Payload Format
```json
{
  "event": "charge.completed",
  "data": {
    "id": "transaction_id",
    "tx_ref": "trader_email_timestamp",
    "flw_ref": "reference_number",
    "status": "successful",
    "amount": 50,
    "currency": "USD",
    "customer": {
      "email": "trader@example.com",
      "name": "Trader Name"
    }
  }
}
```

### Required Credentials
- **FLUTTERWAVE_PUBLIC_KEY** = `pk_test_...` or `pk_live_...`
- **FLUTTERWAVE_SECRET_KEY** = `sk_test_...` or `sk_live_...`
- **FLUTTERWAVE_SECRET_HASH** = `flw_webhook_...` (from Settings → Webhooks)

### Webhook Setup
- URL: `https://yourdomain.com/api/payment/webhooks/flutterwave`
- Header to check: `flutterwave-signature`
- Events to listen for: `charge.completed`

**Where to get credentials:**
1. Login to https://dashboard.flutterwave.com
2. Go to **Settings** → **API & Webhooks**
3. Copy your Public Key and Secret Key
4. Go to **Settings** → **Webhooks**
5. Copy your Webhook Secret Hash
6. Add webhook URL: `https://yourdomain.com/api/payment/webhooks/flutterwave`

---

## 2. BINANCE PAY API SPEC

### Webhook Signature Verification
<cite index="13-2,13-6,13-7">Binance Pay uses timestamp and nonce headers. The signature is calculated as: `timestamp + "\n" + nonce + "\n" + body + "\n"`. The algorithm uses SHA256.</cite>

```
Headers: Binancepay-Timestamp, Binancepay-Nonce, Binancepay-Signature
Algorithm: SHA256 with public key verification
Payload: timestamp + "\n" + nonce + "\n" + body + "\n"
```

### Webhook Payload Format
```json
{
  "bizType": "PAY",
  "data": "{\"merchantTradeNo\":\"9825382937292\",\"totalFee\":0.88,\"transactTime\":1619508939664,\"currency\":\"USDT\",\"tradeType\":\"WEB\"}",
  "bizId": 29383937493038367292,
  "bizStatus": "PAY_SUCCESS"
}
```

### Required Credentials
- **BINANCE_API_KEY** = `merchant API key`
- **BINANCE_SECRET_KEY** = `merchant secret key`
- **BINANCE_WEBHOOK_SECRET** = `public key from Certificate API`

### Webhook Setup
- URL: `https://yourdomain.com/api/payment/webhooks/binance`
- Response: HTTP 200 with `{"returnCode":"SUCCESS"}`
- Events: `PAY_SUCCESS`, `PAY_CLOSED`

**Where to get credentials:**
1. Login to https://merchant.binance.com
2. Go to **Developers** → **API Management**
3. Create API Key with webhook permissions
4. Go to **Webhooks** and add your endpoint
5. Use **Query Certificate API** to get public key for signature verification

---

## 3. BYBIT CRYPTO PAYMENT (TRC20) API SPEC

### Webhook Signature Verification
<cite index="30-16">Bybit uses API Key and Secret pair with HMAC SHA256 signature generation for request validation. Timestamp must be within 5 seconds of server time.</cite>

```
Headers: x-signature, timestamp, nonce
Algorithm: HMAC SHA256
Signature: crypto.createHmac('sha256', secretKey).update(payload).digest('hex')
Network: TRON (TRC20)
```

### Payment Request Format
For TRC20 (USDT on TRON):
```json
{
  "wallet_address": "TQN89SfxQQJaZZScnUZmktEJwQeWReGMqW",
  "amount": 50,
  "currency": "USDT",
  "network": "TRC20",
  "order_id": "order_12345",
  "description": "WFX Trading Entry Fee"
}
```

### Webhook Payload Format
```json
{
  "id": "webhook_id",
  "merchant_id": "your_merchant_id",
  "merchant_custom_id": "order_12345",
  "order_id": "bybit_order_id",
  "status": "SUCCESS",
  "amount": 50,
  "currency": "USDT",
  "create_time": 1723186761000,
  "customer": {
    "email": "trader@example.com",
    "name": "Trader Name"
  }
}
```

### Required Credentials
- **BYBIT_API_KEY** = `api key from merchant dashboard`
- **BYBIT_SECRET_KEY** = `secret key from merchant dashboard`
- **BYBIT_WEBHOOK_SECRET** = `webhook secret hash`

### Webhook Setup
- URL: `https://yourdomain.com/api/payment/webhooks/bybit`
- Header to check: `x-signature`
- Response: HTTP 200 with success message
- Events to listen for: `status === "SUCCESS"`

**Where to get credentials:**
1. Login to https://www.bybit.com
2. Go to **Merchant Dashboard** → **API Management**
3. Create API Key for payment processing
4. Enable webhook notifications
5. Add webhook endpoint: `https://yourdomain.com/api/payment/webhooks/bybit`

---

## PASTE YOUR CREDENTIALS HERE

When you have obtained your credentials from all three processors, paste them below:

```bash
# ===== FLUTTERWAVE =====
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_SECRET_HASH=
FLUTTERWAVE_REDIRECT_URL=https://yourdomain.com/payment/success?method=flutterwave

# ===== BINANCE PAY =====
BINANCE_API_KEY=
BINANCE_SECRET_KEY=
BINANCE_WEBHOOK_SECRET=

# ===== BYBIT (TRC20) =====
BYBIT_API_KEY=
BYBIT_SECRET_KEY=
BYBIT_WEBHOOK_SECRET=

# ===== SENDGRID (EMAIL) =====
SENDGRID_API_KEY=
```

---

## What I'll Do Next

Once you provide the credentials above:

1. ✅ Update webhook handlers with your API keys
2. ✅ Configure signature verification for all three processors
3. ✅ Test webhook endpoints
4. ✅ Integrate with admin dashboard
5. ✅ Set up failed payment alerts

---

## Testing Without Credentials

You can still test the payment flow by:

1. **Using test/sandbox APIs** - Each processor provides test credentials
2. **Using test payment methods** - Each has test card/wallet numbers
3. **Mocking webhooks** - I can create a test endpoint that simulates payments

Would you like me to create a mock/test payment flow while you get the credentials?
