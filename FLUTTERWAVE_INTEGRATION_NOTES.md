# Flutterwave Integration Testing Guide

## What Was Fixed

The Flutterwave payment integration now properly:

1. **Shows Payment Selection** - User selects "Flutterwave" from 3 payment method options (Flutterwave, Binance, Bybit)
2. **Opens Flutterwave Modal** - When user clicks "Pay $15 with Flutterwave", the Flutterwave SDK opens a secure payment modal
3. **Completes Payment** - User selects their preferred payment method (Card, Mobile Money, USSD, etc.) in the modal
4. **Shows Success** - After successful payment, shows confirmation screen with dashboard link

## How the Integration Works

### Frontend Flow
- `client/pages/RegistrationPage.tsx` loads the Flutterwave SDK from `https://checkout.flutterwave.com/v3.js`
- When user selects Flutterwave and clicks "Pay", it:
  1. Initiates payment with the server (`/api/payment/initiate/flutterwave`)
  2. Registers the trader in Supabase
  3. Opens Flutterwave payment modal with `window.FlutterwaveCheckout()`
  4. Handles the payment response via callback

### Server Flow
- `server/routes/payment.ts` endpoint `/api/payment/initiate/flutterwave` returns:
  - `public_key`: Flutterwave public key
  - `txRef`: Unique transaction reference
  - `redirect_url`: Callback URL after payment
  - `amount`, `currency`, etc.

## Testing Flutterwave

### Prerequisites
1. ✅ Flutterwave SDK is loaded in `index.html`
2. ✅ Environment variable `FLUTTERWAVE_PUBLIC_KEY` is set
3. ✅ Server routes are configured

### Testing Steps

1. **Go to Registration Page**
   - Navigate to `/register`
   - Fill in all form fields (name, email, phone, country)
   - Click "Continue to Payment"

2. **Select Flutterwave**
   - Click the Flutterwave option (💰 icon)
   - Verify it's highlighted with a checkmark
   - Click "Pay $15 with Flutterwave"

3. **Complete Payment**
   - Flutterwave modal should open
   - You should see payment method options (Card, Mobile Money, USSD, etc.)
   - Follow the payment flow
   - For test mode: Use test card `4242 4242 4242 4242` with any future date and CVC

4. **Verify Success**
   - After completing payment, you should see "Registration Complete!" screen
   - Click "Go to Dashboard" to view your trading credentials

## Troubleshooting

### Issue: "No payment options for flutterwave"

**Possible Causes:**
1. **Flutterwave SDK not loaded** - Check browser console for script loading errors
   - Open DevTools (F12)
   - Check Network tab for `checkout.flutterwave.com/v3.js`
   - Look for any CORS or CSP errors

2. **Invalid Flutterwave Public Key**
   - The configured public key might be invalid or expired
   - Check that `FLUTTERWAVE_PUBLIC_KEY` in `.env` is correct
   - Verify the key starts with `FLWPUBK_`

3. **Account Configuration**
   - The Flutterwave account might not have payment methods enabled
   - Log in to your Flutterwave dashboard to verify:
     - Account is active
     - Payment methods are enabled
     - Account is in the correct mode (test vs live)

### Issue: Modal doesn't open

**Solutions:**
1. Check browser console for errors (F12 → Console tab)
2. Look for logs starting with `[Registration]` to see what's happening
3. Verify Flutterwave script loaded: Look for `window.FlutterwaveCheckout` in console
4. Try reloading the page and testing again

### Issue: Payment successful but no credentials

1. Check `/dashboard` - credentials may be loading
2. If credentials don't appear after 30 seconds:
   - Manually verify trader was created in Supabase
   - Check if admin needs to assign credentials
   - Contact support

## Browser Console Logs

When testing, you should see logs in the browser console:

```
[Registration] Flutterwave initiated with data: {...}
[Registration] Opening Flutterwave modal...
[Registration] Flutterwave callback received: {status: "successful", ...}
✅ Payment successful
```

## Testing Alternative Payment Methods

If you want to test Binance or Bybit payment flows:

1. **Binance Pay**
   - Select Binance option
   - Click "Pay $15 with Binance Pay"
   - Follow manual payment instructions with Merchant ID

2. **Bybit Pay**
   - Select Bybit option
   - Click "Pay $15 with Bybit Pay"
   - Follow manual payment instructions with USDT wallet address

## Additional Resources

- Flutterwave Docs: https://developer.flutterwave.com/docs/payments/standard
- API Endpoint: `POST /api/payment/initiate/flutterwave`
- Payment Route: `server/routes/payment.ts`
- Registration Component: `client/pages/RegistrationPage.tsx`
