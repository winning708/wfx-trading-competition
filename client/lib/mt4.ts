import { supabase } from './supabase';

export interface MT4Integration {
  id: string;
  credential_id: string;
  mt4_account_id: string;
  mt4_api_token: string;
  mt4_server_endpoint: string;
  mt4_platform: 'mt4' | 'mt5';
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  last_sync: string | null;
  last_error: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncHistoryRecord {
  id: string;
  integration_id: string;
  sync_type: 'manual' | 'automatic';
  status: 'pending' | 'in_progress' | 'success' | 'error';
  records_updated: number;
  error_message: string | null;
  synced_at: string;
}

/**
 * Link a trading credential to MT4/MT5
 */
export async function linkMT4Account(
  credentialId: string,
  mt4AccountId: string,
  mt4ApiToken: string,
  mt4ServerEndpoint: string,
  mt4Platform: 'mt4' | 'mt5' = 'mt4'
): Promise<{ success: boolean; integration?: MT4Integration; error?: string }> {
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
      console.error('Error linking MT4 account:', error);
      return { success: false, error: error.message };
    }

    return { success: true, integration: data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error linking MT4 account:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get all MT4 integrations for a credential
 */
export async function getMT4Integrations(credentialId?: string): Promise<MT4Integration[]> {
  try {
    let query = supabase.from('mt4_integrations').select('*');

    if (credentialId) {
      query = query.eq('credential_id', credentialId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching MT4 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching MT4 integrations:', error);
    return [];
  }
}

/**
 * Get all active MT4 integrations
 */
export async function getActiveMT4Integrations(): Promise<MT4Integration[]> {
  try {
    const { data, error } = await supabase
      .from('mt4_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active MT4 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active MT4 integrations:', error);
    return [];
  }
}

/**
 * Get MT4 integrations with credential details
 */
export async function getMT4IntegrationsWithDetails(): Promise<
  (MT4Integration & { credential?: { account_username: string; account_number: string } })[]
> {
  try {
    const { data: integrations, error: intError } = await supabase
      .from('mt4_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (intError) {
      console.error('Error fetching MT4 integrations:', intError);
      return [];
    }

    if (!integrations || integrations.length === 0) {
      return [];
    }

    // Get all credentials
    const { data: credentials, error: credError } = await supabase
      .from('trading_credentials')
      .select('id, account_username, account_number')
      .in(
        'id',
        integrations.map((i) => i.credential_id)
      );

    if (credError) {
      console.error('Error fetching credentials:', credError);
      return integrations;
    }

    // Merge data
    const credentialMap = new Map(credentials?.map((c) => [c.id, c]) || []);

    return integrations.map((integration) => ({
      ...integration,
      credential: credentialMap.get(integration.credential_id),
    }));
  } catch (error) {
    console.error('Error fetching MT4 integrations with details:', error);
    return [];
  }
}

/**
 * Update MT4 integration
 */
export async function updateMT4Integration(
  integrationId: string,
  updates: Partial<
    Omit<MT4Integration, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'last_sync' | 'last_error'>
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('mt4_integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating MT4 integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating MT4 integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Delete MT4 integration
 */
export async function deleteMT4Integration(integrationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('mt4_integrations')
      .update({ is_active: false })
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting MT4 integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting MT4 integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual MT4 sync for all integrations
 */
export async function triggerMT4SyncAll(): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  failed?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/sync/mt4/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Sync failed' };
    }

    return { success: true, ...data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error triggering MT4 sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual MT4 sync for specific integration
 */
export async function triggerMT4SyncIntegration(integrationId: string): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/sync/mt4/trigger/${integrationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Sync failed' };
    }

    return { success: true, ...data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error triggering MT4 sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get recent MT4 sync history
 */
export async function getRecentMT4Syncs(
  integrationId: string,
  limit: number = 10
): Promise<SyncHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('sync_history')
      .select('*')
      .eq('integration_id', integrationId)
      .order('synced_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching sync history:', error);
    return [];
  }
}
