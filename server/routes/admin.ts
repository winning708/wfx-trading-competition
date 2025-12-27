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
 * Verify Admin Password
 * POST /api/admin/verify-password
 */
export const verifyAdminPassword: RequestHandler = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Get admin password from environment variable (with fallback)
    const adminPassword = process.env.ADMIN_PASSWORD || 'Winning@708';

    console.log('[Admin] ============================================');
    console.log('[Admin] Password verification attempt');
    console.log('[Admin] Environment variable ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD);
    console.log('[Admin] Admin password length:', adminPassword.length);
    console.log('[Admin] Admin password (first 5 chars):', adminPassword.substring(0, 5));
    console.log('[Admin] Received password length:', password.length);
    console.log('[Admin] Received password (first 5 chars):', password.substring(0, 5));
    console.log('[Admin] ============================================');

    // Trim both for comparison safety
    const trimmedPassword = password.trim();
    const trimmedAdminPassword = adminPassword.trim();

    // Check character by character
    const match = trimmedPassword === trimmedAdminPassword;

    console.log('[Admin] After trimming:');
    console.log('  Received length:', trimmedPassword.length);
    console.log('  Expected length:', trimmedAdminPassword.length);
    console.log('  Direct match:', match);

    if (!match) {
      console.log('  Character comparison:');
      for (let i = 0; i < Math.max(trimmedPassword.length, trimmedAdminPassword.length); i++) {
        const received = trimmedPassword.charCodeAt(i) || 'undefined';
        const expected = trimmedAdminPassword.charCodeAt(i) || 'undefined';
        console.log(`    [${i}] Received: ${trimmedPassword[i] || 'END'} (${received}) vs Expected: ${trimmedAdminPassword[i] || 'END'} (${expected})`);
      }
    }

    // Verify password (simple comparison - in production, consider hashing)
    if (match) {
      // Generate a simple token (in production, use JWT or similar)
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

      console.log('[Admin] ✅ Admin login successful');
      return res.json({
        success: true,
        message: 'Admin authenticated',
        token
      });
    } else {
      console.warn('[Admin] ⚠️ Failed admin login attempt with incorrect password');
      return res.status(401).json({ success: false, message: 'Incorrect admin password' });
    }
  } catch (error) {
    console.error('[Admin] Error in verifyAdminPassword:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

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

    // Auto-assign an unassigned credential if available
    try {
      // First, check if this trader already has a credential assignment
      const { data: existingAssignment } = await supabase
        .from('credential_assignments')
        .select('id')
        .eq('trader_id', traderId)
        .maybeSingle();

      // Only assign if trader doesn't already have a credential
      if (!existingAssignment) {
        // Get all credentials that are assigned to someone
        const { data: assignedCredentialIds } = await supabase
          .from('credential_assignments')
          .select('credential_id');

        const assignedIds = new Set((assignedCredentialIds || []).map((a: any) => a.credential_id));

        // Get the first active credential that hasn't been assigned yet
        const { data: allCredentials } = await supabase
          .from('trading_credentials')
          .select('id')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        const unassignedCredential = (allCredentials || []).find((cred: any) => !assignedIds.has(cred.id));

        if (unassignedCredential) {
          const { error: assignError } = await supabase
            .from('credential_assignments')
            .insert([
              {
                trader_id: traderId,
                credential_id: unassignedCredential.id,
              },
            ]);

          if (assignError) {
            console.warn('[Admin] Warning: Could not auto-assign credential:', assignError);
          } else {
            console.log('[Admin] ✅ Credential auto-assigned to trader:', { traderId, credentialId: unassignedCredential.id });
          }
        } else {
          console.warn('[Admin] ⚠️ No unassigned credentials available for trader:', traderId);
        }
      }
    } catch (assignmentError) {
      console.warn('[Admin] Warning: Auto-assignment failed but payment was approved:', assignmentError);
      // Don't fail the payment approval if auto-assignment fails
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
 * Delete Trader
 * DELETE /api/admin/traders/:traderId
 */
export const deleteTrader: RequestHandler = async (req, res) => {
  try {
    const { traderId } = req.params;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID is required' });
    }

    // Get trader details first
    const { data: trader, error: fetchError } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (fetchError || !trader) {
      console.error('[Admin] Error fetching trader:', fetchError);
      return res.status(404).json({ success: false, message: 'Trader not found' });
    }

    // Delete associated performance data first
    await supabase
      .from('performance_data')
      .delete()
      .eq('trader_id', traderId);

    // Delete associated credential assignments
    await supabase
      .from('credential_assignments')
      .delete()
      .eq('trader_id', traderId);

    // Delete the trader
    const { error: deleteError } = await supabase
      .from('traders')
      .delete()
      .eq('id', traderId);

    if (deleteError) {
      console.error('[Admin] Error deleting trader:', deleteError);
      return res.status(500).json({ success: false, message: 'Failed to delete trader' });
    }

    console.log('[Admin] ✅ Trader deleted:', { id: traderId, email: trader.email, name: trader.full_name });
    res.json({ success: true, message: `Trader ${trader.full_name} has been deleted` });
  } catch (error) {
    console.error('[Admin] Error in deleteTrader:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get Traders with Passwords
 * GET /api/admin/traders-with-passwords
 */
export const getTradersWithPasswords: RequestHandler = async (req, res) => {
  try {
    const { data: traders, error } = await supabase
      .from('traders')
      .select('id, username, email, full_name, trader_password, payment_status, registered_at')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('[Admin] Error fetching traders with passwords:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch traders' });
    }

    res.json({ success: true, traders: traders || [] });
  } catch (error) {
    console.error('[Admin] Error in getTradersWithPasswords:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Handle Password Reset Request
 * POST /api/admin/password-reset-request
 */
export const handlePasswordResetRequest: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Verify trader exists
    const { data: trader, error: fetchError } = await supabase
      .from('traders')
      .select('id, full_name, email')
      .eq('email', email)
      .maybeSingle();

    if (fetchError || !trader) {
      console.error('[Admin] Error verifying trader:', fetchError);
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: 'If the email exists in our system, a password reset request has been sent to our admin team.'
      });
    }

    // Store password reset request in database
    try {
      const { error: insertError } = await supabase
        .from('password_reset_requests')
        .insert([
          {
            trader_id: trader.id,
            email: trader.email,
            full_name: trader.full_name,
            status: 'pending',
          },
        ]);

      if (insertError) {
        console.error('[Admin] Error storing password reset request:', insertError);
        // Don't fail the request if storing fails
      }
    } catch (storeError) {
      console.warn('[Admin] Warning: Could not store password reset request:', storeError);
      // Don't fail the request if storing fails
    }

    // Send email to admin about password reset request
    try {
      await sendAdminNotification({
        traderId: trader.id,
        email: trader.email,
        fullName: trader.full_name,
        amount: 0,
        currency: 'USD',
        country: 'Unknown',
        paymentMethod: 'password-reset',
        dashboardUrl: `${process.env.BACKEND_URL || 'http://localhost:5173'}/admin#password-requests`,
      });
    } catch (emailError) {
      console.warn('[Admin] Warning: Could not send admin notification:', emailError);
      // Don't fail the request if email notification fails
    }

    console.log('[Admin] ✅ Password reset request received for:', { id: trader.id, email: trader.email });
    res.json({
      success: true,
      message: 'Password reset request submitted. Our admin team will contact you within 24 hours.'
    });
  } catch (error) {
    console.error('[Admin] Error in handlePasswordResetRequest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get Password Reset Requests
 * GET /api/admin/password-reset-requests
 */
export const getPasswordResetRequests: RequestHandler = async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('[Admin] Error fetching password reset requests:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch password reset requests' });
    }

    res.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error('[Admin] Error in getPasswordResetRequests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update Password Reset Request Status
 * POST /api/admin/password-reset-requests/:requestId/resolve
 */
export const updatePasswordResetRequestStatus: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes, resolvedBy } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status !== 'pending') {
      updateData.resolved_at = new Date().toISOString();
      if (resolvedBy) updateData.resolved_by = resolvedBy;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('password_reset_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('[Admin] Error updating password reset request:', error);
      return res.status(500).json({ success: false, message: 'Failed to update password reset request' });
    }

    console.log('[Admin] ✅ Password reset request updated:', { id: requestId, status });
    res.json({ success: true, message: 'Password reset request updated successfully' });
  } catch (error) {
    console.error('[Admin] Error in updatePasswordResetRequestStatus:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      binance_pay_id,
      binance_network,
      bybit_wallet_address,
      bybit_network,
    } = req.body;

    // Validate required fields
    if (!nigerian_account_number || !binance_pay_id || !bybit_wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'Nigerian account number, Binance Pay ID, and Bybit wallet are required',
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
          binance_pay_id,
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
          binance_pay_id,
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
