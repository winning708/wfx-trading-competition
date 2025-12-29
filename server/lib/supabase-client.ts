/**
 * Supabase Backend Client
 * Handles database operations for syncing MyFXBook data
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required configuration
if (!SUPABASE_URL) {
  throw new Error('[Supabase] FATAL: VITE_SUPABASE_URL environment variable is not set. Cannot initialize Supabase client.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] ⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not set.');
  console.warn('[Supabase] ⚠️  Backend MyFXBook sync will not work without this key.');
  console.warn('[Supabase] ⚠️  Set SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
}

console.log('[Supabase] Initializing with URL:', SUPABASE_URL);
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || 'sk_placeholder_key');

export interface MyFXBookIntegrationData {
  id: string;
  credential_id: string;
  myfxbook_account_id: string;
  myfxbook_password: string;
  sync_status: string;
  last_sync: string | null;
}

export interface MT5IntegrationData {
  id: string;
  credential_id: string;
  mt5_account_id: string;
  mt5_api_token: string;
  mt5_server_endpoint: string;
  sync_status: string;
  last_sync: string | null;
}

export interface ForexFactoryIntegrationData {
  id: string;
  credential_id: string;
  ff_account_username: string;
  ff_api_key: string;
  ff_system_id: string;
  sync_status: string;
  last_sync: string | null;
  is_active?: boolean;
  last_error?: string;
}

export interface TraderData {
  id: string;
  full_name: string;
  email: string;
}

export interface PerformanceData {
  id: string;
  trader_id: string;
  starting_balance: number;
  current_balance: number;
  profit_percentage: number;
}

/**
 * Get all active MyFXBook integrations (legacy)
 */
export async function getActiveIntegrations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('myfxbook_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveIntegrations:', error);
    return [];
  }
}

/**
 * Get all active MT5 integrations
 */
export async function getActiveMT5Integrations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('mt5_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching MT5 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveMT5Integrations:', error);
    return [];
  }
}

/**
 * Get trader info by credential ID
 */
export async function getTraderByCredentialId(credentialId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('credential_assignments')
      .select('trader_id, traders(id, full_name, email)')
      .eq('credential_id', credentialId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected sometimes
        console.error('Error fetching trader:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getTraderByCredentialId:', error);
    return null;
  }
}

/**
 * Update performance data for a trader
 */
export async function updatePerformanceData(
  traderId: string,
  currentBalance: number,
  profitPercentage: number,
  startingBalance: number = 1000
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('performance_data')
      .update({
        current_balance: currentBalance,
        profit_percentage: profitPercentage,
        last_updated: new Date().toISOString(),
      })
      .eq('trader_id', traderId);

    if (error) {
      console.error('Error updating performance data:', error);
      return false;
    }

    console.log(`[Sync] Updated performance data for trader: ${traderId}`);
    return true;
  } catch (error) {
    console.error('Error in updatePerformanceData:', error);
    return false;
  }
}

/**
 * Log sync attempt to sync_history
 */
export async function logSyncAttempt(
  integrationId: string,
  syncType: 'manual' | 'automatic',
  status: 'in_progress' | 'success' | 'error',
  recordsUpdated: number = 0,
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sync_history')
      .insert([
        {
          integration_id: integrationId,
          sync_type: syncType,
          status,
          records_updated: recordsUpdated,
          error_message: errorMessage,
        },
      ]);

    if (error) {
      console.error('Error logging sync:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logSyncAttempt:', error);
    return false;
  }
}

/**
 * Update integration sync status (MyFXBook)
 */
export async function updateIntegrationSyncStatus(
  integrationId: string,
  syncStatus: 'success' | 'error',
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('myfxbook_integrations')
      .update({
        sync_status: syncStatus,
        last_sync: new Date().toISOString(),
        last_error: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating integration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateIntegrationSyncStatus:', error);
    return false;
  }
}

/**
 * Update MT5 integration sync status
 */
export async function updateMT5IntegrationSyncStatus(
  integrationId: string,
  syncStatus: 'success' | 'error',
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mt5_integrations')
      .update({
        sync_status: syncStatus,
        last_sync: new Date().toISOString(),
        last_error: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating MT5 integration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateMT5IntegrationSyncStatus:', error);
    return false;
  }
}

/**
 * Create a new MT5 integration
 */
export async function createMT5Integration(
  credentialId: string,
  mt5AccountId: string,
  mt5ApiToken: string,
  mt5ServerEndpoint: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('mt5_integrations')
      .insert([
        {
          credential_id: credentialId,
          mt5_account_id: mt5AccountId,
          mt5_api_token: mt5ApiToken,
          mt5_server_endpoint: mt5ServerEndpoint,
          sync_status: 'pending',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating MT5 integration:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createMT5Integration:', error);
    return null;
  }
}

/**
 * Get all active Forex Factory integrations
 */
export async function getActiveForexFactoryIntegrations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('forex_factory_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Forex Factory integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveForexFactoryIntegrations:', error);
    return [];
  }
}

/**
 * Update Forex Factory integration sync status
 */
export async function updateForexFactoryIntegrationSyncStatus(
  integrationId: string,
  syncStatus: 'success' | 'error' | 'syncing' | 'pending',
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('forex_factory_integrations')
      .update({
        sync_status: syncStatus,
        last_sync: new Date().toISOString(),
        last_error: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating Forex Factory integration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateForexFactoryIntegrationSyncStatus:', error);
    return false;
  }
}

/**
 * Create a new Forex Factory integration
 */
export async function createForexFactoryIntegration(
  credentialId: string,
  ffAccountUsername: string,
  ffApiKey: string,
  ffSystemId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('forex_factory_integrations')
      .insert([
        {
          credential_id: credentialId,
          ff_account_username: ffAccountUsername,
          ff_api_key: ffApiKey,
          ff_system_id: ffSystemId,
          sync_status: 'pending',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating Forex Factory integration:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createForexFactoryIntegration:', error);
    return null;
  }
}

/**
 * Get starting balance for a trader
 */
export async function getTraderStartingBalance(traderId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('performance_data')
      .select('starting_balance')
      .eq('trader_id', traderId)
      .single();

    if (error) {
      console.error('Error fetching starting balance:', error);
      return 1000; // Default fallback
    }

    return data?.starting_balance || 1000;
  } catch (error) {
    console.error('Error in getTraderStartingBalance:', error);
    return 1000;
  }
}

/**
 * Update trader payment status after successful payment
 */
export async function updateTraderPaymentStatus(
  email: string,
  paymentStatus: 'completed' | 'pending' | 'failed',
  transactionId: string,
  paymentMethod: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('traders')
      .update({
        entry_fee_paid: paymentStatus === 'completed',
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) {
      console.error('Error updating trader payment status:', error);
      return false;
    }

    console.log(`[Payment] Updated payment status for ${email}: ${paymentStatus}`);

    // Log payment transaction
    await logPaymentTransaction(email, transactionId, paymentMethod, paymentStatus);

    return true;
  } catch (error) {
    console.error('Error in updateTraderPaymentStatus:', error);
    return false;
  }
}

/**
 * Log payment transaction for audit trail
 */
export async function logPaymentTransaction(
  email: string,
  transactionId: string,
  paymentMethod: string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
  amount?: number,
  errorMessage?: string
): Promise<boolean> {
  try {
    // Get trader ID by email
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('id')
      .eq('email', email)
      .single();

    if (traderError || !trader) {
      console.error('[Payment] Error fetching trader for logging:', traderError);
      return false;
    }

    // Insert transaction log
    const { error } = await supabase
      .from('payment_transactions')
      .insert([
        {
          trader_id: trader.id,
          payment_method: paymentMethod,
          amount: amount || 0,
          currency: 'USD',
          status: status,
          reference_id: `${paymentMethod}_${transactionId}`,
          external_reference: transactionId,
          transaction_details: {
            email,
            timestamp: new Date().toISOString(),
          },
          error_message: errorMessage || null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        },
      ]);

    if (error) {
      console.error('[Payment] Error logging transaction:', error);
      return false;
    }

    console.log('[Payment] Transaction logged:', {
      email,
      transactionId,
      paymentMethod,
      status,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error logging transaction:', error);
    return false;
  }
}

/**
 * Send confirmation email to trader
 */
export async function sendConfirmationEmail(email: string): Promise<boolean> {
  try {
    // Get trader details
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('full_name, email')
      .eq('email', email)
      .single();

    if (traderError || !trader) {
      console.error('[Payment] Error fetching trader:', traderError);
      return false;
    }

    // Import email service dynamically to avoid circular imports
    const { sendConfirmationEmailToUser } = await import('./email-service');

    const success = await sendConfirmationEmailToUser(trader.email, trader.full_name);

    if (!success) {
      console.error('[Payment] Failed to send confirmation email');
      return false;
    }

    console.log(`[Payment] Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Payment] Error in sendConfirmationEmail:', error);
    return false;
  }
}

/**
 * Send trading credentials email to a trader
 * Fetches the assigned credential details and sends them to the trader's email
 */
export async function sendCredentialsEmailToTrader(
  traderId: string
): Promise<boolean> {
  try {
    // Fetch trader details
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('id, full_name, email')
      .eq('id', traderId)
      .single();

    if (traderError || !trader) {
      console.error('[Credentials Email] Failed to fetch trader:', traderError);
      return false;
    }

    // Fetch assigned credential details
    const { data: assignment, error: assignmentError } = await supabase
      .from('credential_assignments')
      .select('credential_id')
      .eq('trader_id', traderId)
      .maybeSingle();

    if (assignmentError) {
      console.error('[Credentials Email] Database error fetching credential assignment:', assignmentError);
      return false;
    }

    if (!assignment) {
      console.warn('[Credentials Email] No credential assignment found for trader:', traderId);
      console.warn('[Credentials Email] Please assign a trading credential to this trader first');
      return false;
    }

    // Fetch credential details
    const { data: credential, error: credentialError } = await supabase
      .from('trading_credentials')
      .select('account_username, account_password, account_number, broker')
      .eq('id', assignment.credential_id)
      .single();

    if (credentialError || !credential) {
      console.error('[Credentials Email] Failed to fetch credential:', credentialError);
      return false;
    }

    // Dynamically import the email service
    const { sendTradingCredentialsEmail } = await import('./email-service');

    // Send the credentials email
    const success = await sendTradingCredentialsEmail(
      trader.email,
      trader.full_name,
      credential.account_username,
      credential.account_password,
      credential.account_number,
      credential.broker || 'JustMarkets'
    );

    if (success) {
      console.log('[Credentials Email] Email sent successfully to:', trader.email);
    } else {
      console.warn('[Credentials Email] Failed to send email to:', trader.email);
    }

    return success;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Credentials Email] Error:', errorMessage);
    console.error('[Credentials Email] Full error details:', JSON.stringify(error, null, 2));
    return false;
  }
}
