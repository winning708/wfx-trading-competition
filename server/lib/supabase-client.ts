/**
 * Supabase Backend Client
 * Handles database operations for syncing MyFXBook data
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cujdemfiikeoamryjwza.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sk_placeholder_key';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not set.');
  console.warn('⚠️  Backend MyFXBook sync will not work without this key.');
  console.warn('⚠️  Set SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
      .select(`
        id,
        credential_id,
        myfxbook_account_id,
        myfxbook_password,
        sync_status,
        last_sync,
        trading_credentials(id),
        credential_assignments(trader_id)
      `)
      .eq('is_active', true);

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
 * Get all active MT4/MT5 integrations
 */
export async function getActiveMT4Integrations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('mt4_integrations')
      .select(`
        id,
        credential_id,
        mt4_account_id,
        mt4_api_token,
        mt4_server_endpoint,
        mt4_platform,
        sync_status,
        last_sync,
        trading_credentials(id),
        credential_assignments(trader_id)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching MT4 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveMT4Integrations:', error);
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
 * Update MT4/MT5 integration sync status
 */
export async function updateMT4IntegrationSyncStatus(
  integrationId: string,
  syncStatus: 'success' | 'error',
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mt4_integrations')
      .update({
        sync_status: syncStatus,
        last_sync: new Date().toISOString(),
        last_error: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating MT4 integration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateMT4IntegrationSyncStatus:', error);
    return false;
  }
}

/**
 * Create a new MT4/MT5 integration
 */
export async function createMT4Integration(
  credentialId: string,
  mt4AccountId: string,
  mt4ApiToken: string,
  mt4ServerEndpoint: string,
  mt4Platform: 'mt4' | 'mt5' = 'mt4'
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('mt4_integrations')
      .insert([
        {
          credential_id: credentialId,
          mt4_account_id: mt4AccountId,
          mt4_api_token: mt4ApiToken,
          mt4_server_endpoint: mt4ServerEndpoint,
          mt4_platform: mt4Platform,
          sync_status: 'pending',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating MT4 integration:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createMT4Integration:', error);
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
