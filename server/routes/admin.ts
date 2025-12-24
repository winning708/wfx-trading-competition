/**
 * Admin Routes
 * Handles admin operations like payment approval/rejection
 */

import { RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { sendAdminNotification, sendApprovalEmail } from '../lib/email-service';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Get Pending Payments
 * GET /api/admin/payments/pending
 */
export const getPendingPayments: RequestHandler = async (req, res) => {
  try {
    const { data: traders, error } = await supabase
      .from('traders')
      .select('*')
      .eq('payment_status', 'pending')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('[Admin] Error fetching pending payments:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch pending payments' });
    }

    res.json({ success: true, payments: traders || [] });
  } catch (error) {
    console.error('[Admin] Error in getPendingPayments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Approve Payment
 * POST /api/admin/payments/:traderId/approve
 */
export const approvePayment: RequestHandler = async (req, res) => {
  try {
    const { traderId } = req.params;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID is required' });
    }

    // Get trader details
    const { data: trader, error: fetchError } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (fetchError || !trader) {
      console.error('[Admin] Error fetching trader:', fetchError);
      return res.status(404).json({ success: false, message: 'Trader not found' });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('traders')
      .update({ payment_status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', traderId);

    if (updateError) {
      console.error('[Admin] Error updating trader payment status:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to approve payment' });
    }

    // Send approval email to trader
    await sendApprovalEmail(trader.email, trader.full_name);

    console.log('[Admin] ✅ Payment approved for trader:', { id: traderId, email: trader.email });
    res.json({ success: true, message: 'Payment approved successfully' });
  } catch (error) {
    console.error('[Admin] Error in approvePayment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Reject Payment
 * POST /api/admin/payments/:traderId/reject
 */
export const rejectPayment: RequestHandler = async (req, res) => {
  try {
    const { traderId } = req.params;
    const { reason } = req.body;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID is required' });
    }

    // Get trader details
    const { data: trader, error: fetchError } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (fetchError || !trader) {
      console.error('[Admin] Error fetching trader:', fetchError);
      return res.status(404).json({ success: false, message: 'Trader not found' });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('traders')
      .update({ 
        payment_status: 'rejected', 
        updated_at: new Date().toISOString(),
        entry_fee_paid: false 
      })
      .eq('id', traderId);

    if (updateError) {
      console.error('[Admin] Error updating trader payment status:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to reject payment' });
    }

    console.log('[Admin] ✅ Payment rejected for trader:', { id: traderId, email: trader.email, reason });
    res.json({ success: true, message: 'Payment rejected successfully' });
  } catch (error) {
    console.error('[Admin] Error in rejectPayment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Notify Admin About New Payment
 * POST /api/admin/notify-payment
 * This is called when a new payment is submitted
 */
export const notifyAdminPayment: RequestHandler = async (req, res) => {
  try {
    const { traderId, email, fullName, amount, currency, country, paymentMethod } = req.body;

    if (!traderId || !email || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get admin email(s) from environment
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('[Admin] Admin email not configured, skipping notification');
      return res.json({ success: true, message: 'No admin configured for notifications' });
    }

    // Send notification email
    await sendAdminNotification({
      traderId,
      email,
      fullName,
      amount,
      currency,
      country,
      paymentMethod,
      dashboardUrl: `${process.env.BACKEND_URL || 'http://localhost:5173'}/admin#payments`,
    });

    console.log('[Admin] ✅ Admin notified about new payment from:', email);
    res.json({ success: true, message: 'Admin notified successfully' });
  } catch (error) {
    console.error('[Admin] Error in notifyAdminPayment:', error);
    // Don't fail the registration if notification fails
    res.json({ success: true, message: 'Payment submitted (notification may have failed)' });
  }
};

/**
 * Get Admin Payment Settings
 * GET /api/admin/payment-settings
 */
export const getPaymentSettings: RequestHandler = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('admin_payment_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('[Admin] Error fetching payment settings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch payment settings' });
    }

    // Return settings or empty object if none exist
    res.json({ success: true, settings: settings || null });
  } catch (error) {
    console.error('[Admin] Error in getPaymentSettings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update Admin Payment Settings
 * POST /api/admin/payment-settings
 */
export const updatePaymentSettings: RequestHandler = async (req, res) => {
  try {
    const {
      nigerian_bank_name,
      nigerian_account_name,
      nigerian_account_number,
      nigerian_swift_code,
      binance_wallet_address,
      binance_network,
      bybit_wallet_address,
      bybit_network,
    } = req.body;

    // Validate required fields
    if (!nigerian_account_number || !binance_wallet_address || !bybit_wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'Nigerian account number, Binance wallet, and Bybit wallet are required',
      });
    }

    // First, try to get existing settings
    const { data: existingSettings } = await supabase
      .from('admin_payment_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let result;

    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('admin_payment_settings')
        .update({
          nigerian_bank_name,
          nigerian_account_name,
          nigerian_account_number,
          nigerian_swift_code,
          binance_wallet_address,
          binance_network,
          bybit_wallet_address,
          bybit_network,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('admin_payment_settings')
        .insert({
          nigerian_bank_name,
          nigerian_account_name,
          nigerian_account_number,
          nigerian_swift_code,
          binance_wallet_address,
          binance_network,
          bybit_wallet_address,
          bybit_network,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('[Admin] Error updating payment settings:', result.error);
      return res.status(500).json({ success: false, message: 'Failed to update payment settings' });
    }

    console.log('[Admin] ✅ Payment settings updated');
    res.json({ success: true, settings: result.data, message: 'Payment settings updated successfully' });
  } catch (error) {
    console.error('[Admin] Error in updatePaymentSettings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
