import { supabase } from './supabase';

export interface MT5Integration {
  id: string;
  credential_id: string;
  mt5_account_id: string;
  mt5_api_token: string;
  mt5_server_endpoint: string;
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
 * Link a trading credential to MT5
 */
export async function linkMT5Account(
  credentialId: string,
  mt5AccountId: string,
  mt5ApiToken: string,
  mt5ServerEndpoint: string
): Promise<{ success: boolean; integration?: MT5Integration; error?: string }> {
  try {
    console.log('[MT5] Linking account with:', {
      credentialId,
      mt5AccountId,
      mt5ApiToken: mt5ApiToken ? '***' : 'empty',
      mt5ServerEndpoint,
    });

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
      console.error('[MT5] Error linking MT5 account:', error);
      return { success: false, error: error.message };
    }

    console.log('[MT5] Successfully linked account:', data);
    return { success: true, integration: data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT5] Error linking MT5 account:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get all MT5 integrations for a credential
 */
export async function getMT5Integrations(credentialId?: string): Promise<MT5Integration[]> {
  try {
    let query = supabase.from('mt5_integrations').select('*');

    if (credentialId) {
      query = query.eq('credential_id', credentialId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching MT5 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching MT5 integrations:', error);
    return [];
  }
}

/**
 * Get all active MT5 integrations
 */
export async function getActiveMT5Integrations(): Promise<MT5Integration[]> {
  try {
    const { data, error } = await supabase
      .from('mt5_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active MT5 integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active MT5 integrations:', error);
    return [];
  }
}

/**
 * Get MT5 integrations with credential details
 */
export async function getMT5IntegrationsWithDetails(): Promise<
  (MT5Integration & { credential?: { account_username: string; account_number: string } })[]
> {
  try {
    const { data: integrations, error: intError } = await supabase
      .from('mt5_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (intError) {
      console.error('Error fetching MT5 integrations:', intError);
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
    console.error('Error fetching MT5 integrations with details:', error);
    return [];
  }
}

/**
 * Update MT5 integration
 */
export async function updateMT5Integration(
  integrationId: string,
  updates: Partial<
    Omit<MT5Integration, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'last_sync' | 'last_error'>
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('mt5_integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating MT5 integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating MT5 integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Delete MT5 integration
 */
export async function deleteMT5Integration(integrationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('mt5_integrations')
      .update({ is_active: false })
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting MT5 integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting MT5 integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual MT5 sync for all integrations
 */
export async function triggerMT5SyncAll(): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  failed?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/sync/mt5/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    console.log('[MT5 Sync] Response:', { status: response.status, ok: response.ok, data });

    if (!response.ok) {
      return { success: false, error: data.message || 'Sync failed' };
    }

    // If backend returned success: false, convert to error
    if (!data.success) {
      return { success: false, error: data.message || 'Sync failed' };
    }

    return { success: true, ...data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error triggering MT5 sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual MT5 sync for specific integration
 */
export async function triggerMT5SyncIntegration(integrationId: string): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  error?: string;
}> {
  try {
    console.log(`[MT5 Sync] Triggering sync for integration: ${integrationId}`);

    const response = await fetch(`/api/sync/mt5/trigger/${integrationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    console.log('[MT5 Sync] Response:', { status: response.status, ok: response.ok, data });

    if (!response.ok) {
      const errorMsg = data.message || `HTTP ${response.status}`;
      console.error('[MT5 Sync] Request failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    // If backend returned success: false, convert to error
    if (!data.success) {
      const errorMsg = data.error || data.message || 'Sync failed - unknown error';
      console.error('[MT5 Sync] Backend returned success: false:', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log('[MT5 Sync] Sync successful!');
    return { success: true, ...data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT5 Sync] Error triggering sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get recent MT5 sync history
 */
export async function getRecentMT5Syncs(
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
