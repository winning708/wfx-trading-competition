/**
 * Email Routes
 * Handles sending confirmation and receipt emails
 */

import { RequestHandler } from 'express';
import { sendConfirmationEmailToUser, sendPaymentReceiptEmail, sendTradingCredentialsEmail } from '../lib/email-service';
import { sendCredentialsEmailToTrader } from '../lib/supabase-client';

/**
 * Send Confirmation Email
 * POST /api/email/send-confirmation
 * Body: { email, fullName }
 */
export const sendConfirmationEmail: RequestHandler = async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email and fullName are required',
      });
    }

    console.log('[Email] Sending confirmation email to:', email);

    const success = await sendConfirmationEmailToUser(email, fullName);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
      });
    }

    res.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('[Email] Error in sendConfirmationEmail:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Send Payment Receipt Email
 * POST /api/email/send-receipt
 * Body: { email, fullName, amount, paymentMethod, transactionId }
 */
export const sendPaymentReceipt: RequestHandler = async (req, res) => {
  try {
    const { email, fullName, amount, paymentMethod, transactionId } = req.body;

    if (!email || !fullName || !amount || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    console.log('[Email] Sending payment receipt to:', email);

    const success = await sendPaymentReceiptEmail(
      email,
      fullName,
      amount,
      paymentMethod,
      transactionId
    );

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send receipt',
      });
    }

    res.json({ success: true, message: 'Receipt email sent' });
  } catch (error) {
    console.error('[Email] Error in sendPaymentReceipt:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Send Trading Credentials Email
 * POST /api/email/send-credentials
 * Body: { traderId }
 */
export const sendCredentialsEmail: RequestHandler = async (req, res) => {
  try {
    const { traderId } = req.body;

    if (!traderId) {
      return res.status(400).json({
        success: false,
        message: 'Trader ID is required',
      });
    }

    console.log('[Email] Sending credentials email for trader:', traderId);

    const success = await sendCredentialsEmailToTrader(traderId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send credentials email',
      });
    }

    res.json({ success: true, message: 'Credentials email sent' });
  } catch (error) {
    console.error('[Email] Error in sendCredentialsEmail:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
