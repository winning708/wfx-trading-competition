/**
 * Payment Webhook Handlers
 * Handles payment verification from Flutterwave, Binance Pay, and Bybit
 */

import crypto from 'crypto';
import { updateTraderPaymentStatus, sendConfirmationEmail, logPaymentTransaction } from './supabase-client';

interface PaymentWebhookPayload {
  event: string;
  data: {
    id: string;
    tx_ref: string;
    flw_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
    customer?: {
      email: string;
      name: string;
    };
  };
}

interface BinanceWebhookPayload {
  prepayId: string;
  merchantId: string;
  merchantTradeNo: string;
  tradeNo: string;
  status: string;
  totalFee: number;
  currency: string;
  createTime: number;
  goods: Array<{
    goodsType: string;
    goodsCategory: string;
    referenceGoodsId: string;
    goodsName: string;
    goodsDetail: string;
    goodsUnitAmount: {
      currency: string;
    };
    goodsAmount: number;
    goodsUnit: string;
  }>;
}

interface BybitWebhookPayload {
  id: string;
  merchant_id: string;
  merchant_custom_id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  create_time: number;
  update_time: number;
  customer: {
    email: string;
    name?: string;
  };
}

/**
 * Verify Flutterwave webhook signature
 */
export function verifyFlutterwaveSignature(
  signature: string,
  payload: string,
  secretHash: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', secretHash)
      .update(payload)
      .digest('hex');

    return signature === hash;
  } catch (error) {
    console.error('[Payment] Flutterwave signature verification failed:', error);
    return false;
  }
}

/**
 * Verify Binance webhook signature
 */
export function verifyBinanceSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    return signature === hash;
  } catch (error) {
    console.error('[Payment] Binance signature verification failed:', error);
    return false;
  }
}

/**
 * Verify Bybit webhook signature
 */
export function verifyBybitSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    return signature === hash;
  } catch (error) {
    console.error('[Payment] Bybit signature verification failed:', error);
    return false;
  }
}

/**
 * Handle Flutterwave webhook
 */
export async function handleFlutterwaveWebhook(
  payload: PaymentWebhookPayload
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Payment] Flutterwave webhook received:', payload.event);

    if (payload.event !== 'charge.completed') {
      return { success: false, message: 'Unsupported event type' };
    }

    const { data } = payload;

    if (data.status !== 'successful') {
      console.warn('[Payment] Flutterwave payment not successful:', data.status);
      return { success: false, message: 'Payment not successful' };
    }

    // Extract trader email from tx_ref (format: "trader_[email]_[timestamp]")
    const emailMatch = data.tx_ref.match(/trader_(.+?)_\d+$/);
    if (!emailMatch) {
      console.error('[Payment] Could not extract email from tx_ref:', data.tx_ref);
      return { success: false, message: 'Invalid transaction reference' };
    }

    const email = emailMatch[1];

    console.log('[Payment] Processing Flutterwave payment for:', email);

    // Log the transaction
    await logPaymentTransaction(
      email,
      data.id,
      'flutterwave',
      'pending',
      data.amount || 0
    );

    // Update trader payment status
    const success = await updateTraderPaymentStatus(
      email,
      'completed',
      data.id,
      'flutterwave'
    );

    if (!success) {
      // Log failure
      await logPaymentTransaction(
        email,
        data.id,
        'flutterwave',
        'failed',
        data.amount || 0,
        'Failed to update trader status'
      );
      return { success: false, message: 'Failed to update trader' };
    }

    // Update transaction to completed
    await logPaymentTransaction(
      email,
      data.id,
      'flutterwave',
      'completed',
      data.amount || 0
    );

    // Send confirmation email
    await sendConfirmationEmail(email);

    return {
      success: true,
      message: 'Payment processed successfully',
    };
  } catch (error) {
    console.error('[Payment] Error processing Flutterwave webhook:', error);
    return { success: false, message: 'Internal server error' };
  }
}

/**
 * Handle Binance webhook
 */
export async function handleBinanceWebhook(
  payload: BinanceWebhookPayload
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Payment] Binance webhook received:', payload.status);

    if (payload.status !== 'COMPLETED') {
      console.warn('[Payment] Binance payment not completed:', payload.status);
      return { success: false, message: 'Payment not completed' };
    }

    const email = payload.customer?.email;
    if (!email) {
      console.error('[Payment] No email in Binance payload');
      return { success: false, message: 'No customer email' };
    }

    console.log('[Payment] Processing Binance payment for:', email);

    // Update trader payment status
    const success = await updateTraderPaymentStatus(
      email,
      'completed',
      payload.order_id,
      'binance'
    );

    if (!success) {
      return { success: false, message: 'Failed to update trader' };
    }

    // Send confirmation email
    await sendConfirmationEmail(email);

    return {
      success: true,
      message: 'Payment processed successfully',
    };
  } catch (error) {
    console.error('[Payment] Error processing Binance webhook:', error);
    return { success: false, message: 'Internal server error' };
  }
}

/**
 * Handle Bybit webhook
 */
export async function handleBybitWebhook(
  payload: BybitWebhookPayload
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Payment] Bybit webhook received:', payload.status);

    if (payload.status !== 'SUCCESS') {
      console.warn('[Payment] Bybit payment not successful:', payload.status);
      return { success: false, message: 'Payment not successful' };
    }

    const email = payload.customer?.email;
    if (!email) {
      console.error('[Payment] No email in Bybit payload');
      return { success: false, message: 'No customer email' };
    }

    console.log('[Payment] Processing Bybit payment for:', email);

    // Update trader payment status
    const success = await updateTraderPaymentStatus(
      email,
      'completed',
      payload.order_id,
      'bybit'
    );

    if (!success) {
      return { success: false, message: 'Failed to update trader' };
    }

    // Send confirmation email
    await sendConfirmationEmail(email);

    return {
      success: true,
      message: 'Payment processed successfully',
    };
  } catch (error) {
    console.error('[Payment] Error processing Bybit webhook:', error);
    return { success: false, message: 'Internal server error' };
  }
}
