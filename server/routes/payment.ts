/**
 * Payment Routes
 * Handles payment webhooks and payment processor redirects
 */

import { RequestHandler } from 'express';
import {
  handleFlutterwaveWebhook,
  handleBinanceWebhook,
  handleBybitWebhook,
  verifyFlutterwaveSignature,
  verifyBinanceSignature,
  verifyBybitSignature,
} from '../lib/payment-webhooks';

/**
 * Flutterwave Webhook Handler
 * POST /api/payment/webhooks/flutterwave
 */
export const handleFlutterwaveWebhookRequest: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['verificationhash'] as string;
    const payload = JSON.stringify(req.body);

    // Verify signature
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secretHash || !verifyFlutterwaveSignature(signature, payload, secretHash)) {
      console.warn('[Payment] Invalid Flutterwave signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Process webhook
    const result = await handleFlutterwaveWebhook(req.body);

    res.json(result);
  } catch (error) {
    console.error('[Payment] Error in Flutterwave webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Binance Pay Webhook Handler
 * POST /api/payment/webhooks/binance
 */
export const handleBinanceWebhookRequest: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['binancepay-timestamp'] as string;
    const nonce = req.headers['binancepay-nonce'] as string;
    const payload = JSON.stringify(req.body);

    // Reconstruct signature
    const secretKey = process.env.BINANCE_SECRET_KEY;
    if (!secretKey || !verifyBinanceSignature(payload, signature, secretKey)) {
      console.warn('[Payment] Invalid Binance signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Process webhook
    const result = await handleBinanceWebhook(req.body);

    res.json(result);
  } catch (error) {
    console.error('[Payment] Error in Binance webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Bybit Webhook Handler
 * POST /api/payment/webhooks/bybit
 */
export const handleBybitWebhookRequest: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify signature
    const secretKey = process.env.BYBIT_SECRET_KEY;
    if (!secretKey || !verifyBybitSignature(payload, signature, secretKey)) {
      console.warn('[Payment] Invalid Bybit signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Process webhook
    const result = await handleBybitWebhook(req.body);

    res.json(result);
  } catch (error) {
    console.error('[Payment] Error in Bybit webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Payment Success Callback
 * GET /api/payment/success?method=flutterwave&ref=...
 */
export const handlePaymentSuccess: RequestHandler = async (req, res) => {
  try {
    const { method, ref } = req.query;

    console.log('[Payment] Payment success callback:', { method, ref });

    // Redirect to success page
    res.redirect(`/?payment=success&method=${method}&ref=${ref}`);
  } catch (error) {
    console.error('[Payment] Error in payment success:', error);
    res.redirect('/?payment=error');
  }
};

/**
 * Payment Failure Callback
 * GET /api/payment/failure?method=flutterwave&ref=...
 */
export const handlePaymentFailure: RequestHandler = async (req, res) => {
  try {
    const { method, ref } = req.query;

    console.log('[Payment] Payment failure callback:', { method, ref });

    // Redirect to failure page
    res.redirect(`/?payment=failed&method=${method}&ref=${ref}`);
  } catch (error) {
    console.error('[Payment] Error in payment failure:', error);
    res.redirect('/?payment=error');
  }
};

/**
 * Create Flutterwave Payment
 * POST /api/payment/initiate/flutterwave
 * Body: { email, amount, fullName }
 */
export const initiateFlutterwavePayment: RequestHandler = async (req, res) => {
  try {
    const { email, amount, fullName } = req.body;

    if (!email || !amount || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ success: false, message: 'Payment not configured' });
    }

    // Generate unique transaction reference
    const txRef = `trader_${email}_${Date.now()}`;

    const paymentData = {
      public_key: publicKey,
      email,
      amount,
      fullName,
      txRef,
      currency: 'USD',
      redirect_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/success?method=flutterwave&ref=${txRef}`,
      cancelUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/failure?method=flutterwave&ref=${txRef}`,
    };

    res.json({ success: true, paymentData });
  } catch (error) {
    console.error('[Payment] Error in initiateFlutterwavePayment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create Binance Payment (Manual - Merchant ID Only)
 * POST /api/payment/initiate/binance
 * Body: { email, amount, fullName }
 */
export const initiateBinancePayment: RequestHandler = async (req, res) => {
  try {
    const { email, amount, fullName } = req.body;

    if (!email || !amount || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const merchantId = process.env.BINANCE_MERCHANT_ID;

    if (!merchantId) {
      return res.status(500).json({ success: false, message: 'Binance payment not configured' });
    }

    // Generate unique order reference
    const orderRef = `binance_${email}_${Date.now()}`;

    const paymentData = {
      type: 'manual',
      method: 'binance',
      merchantId,
      orderRef,
      email,
      amount,
      fullName,
      currency: 'USD',
      instructions: `Send payment to Binance Merchant ID: ${merchantId}`,
      confirmUrl: `${process.env.BACKEND_URL || 'http://localhost:5173'}/api/payment/confirm-manual?ref=${orderRef}`,
    };

    res.json({ success: true, paymentData });
  } catch (error) {
    console.error('[Payment] Error in initiateBinancePayment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create Bybit Payment (Manual - USDT TRC-20 Wallet Only)
 * POST /api/payment/initiate/bybit
 * Body: { email, amount, fullName }
 */
export const initiateBybitPayment: RequestHandler = async (req, res) => {
  try {
    const { email, amount, fullName } = req.body;

    if (!email || !amount || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const usdtWallet = process.env.BYBIT_USDT_WALLET_ADDRESS;

    if (!usdtWallet) {
      return res.status(500).json({ success: false, message: 'Bybit payment not configured' });
    }

    // Generate unique order reference
    const orderRef = `bybit_${email}_${Date.now()}`;

    const paymentData = {
      type: 'manual',
      method: 'bybit',
      walletAddress: usdtWallet,
      orderRef,
      email,
      amount,
      fullName,
      currency: 'USDT',
      network: 'TRC-20',
      instructions: `Send ${amount} USDT (TRC-20) to wallet: ${usdtWallet}`,
      confirmUrl: `${process.env.BACKEND_URL || 'http://localhost:5173'}/api/payment/confirm-manual?ref=${orderRef}`,
    };

    res.json({ success: true, paymentData });
  } catch (error) {
    console.error('[Payment] Error in initiateBybitPayment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Confirm Manual Payment (for Binance & Bybit manual transfers)
 * POST /api/payment/confirm-manual
 * Body: { ref, method, email, txHash, amount }
 */
export const confirmManualPayment: RequestHandler = async (req, res) => {
  try {
    const { ref, method, email, txHash, amount } = req.body;

    if (!ref || !method || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Payment] Manual payment confirmation:', { method, email, ref });

    // Log the transaction
    await import('../lib/payment-webhooks').then(async (module) => {
      const { logPaymentTransaction } = await import('../lib/supabase-client');

      await logPaymentTransaction(
        email,
        ref,
        method,
        'completed',
        amount || 0,
        `Manual ${method} transfer - ${txHash ? `TxHash: ${txHash}` : 'Payment confirmed'}`
      );
    });

    // Update trader payment status
    const { updateTraderPaymentStatus } = await import('../lib/supabase-client');

    const success = await updateTraderPaymentStatus(
      email,
      'completed',
      ref,
      method
    );

    if (!success) {
      return res.status(500).json({ success: false, message: 'Failed to update payment status' });
    }

    // NOTE: Email sending disabled - credentials are shown on dashboard instead
    // Users will see their credentials immediately after payment on the dashboard

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      ref,
      redirectUrl: `/dashboard?payment=success&ref=${ref}&email=${encodeURIComponent(email)}`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Payment] Error in confirmManualPayment:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('[Payment] Stack trace:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error - check server logs for details',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};
