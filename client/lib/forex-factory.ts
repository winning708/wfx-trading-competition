import { supabase } from './supabase';

export interface ForexFactoryIntegration {
  id: string;
  credential_id: string;
  ff_account_username: string;
  ff_api_key: string;
  ff_system_id: string;
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
 * Link a trading credential to Forex Factory Trade Explorer
 */
export async function linkForexFactoryAccount(
  credentialId: string,
  ffAccountUsername: string,
  ffApiKey: string,
  ffSystemId: string
): Promise<{ success: boolean; integration?: ForexFactoryIntegration; error?: string }> {
  try {
    console.log('[Forex Factory] Linking account with:', {
      credentialId,
      ffAccountUsername,
      ffApiKey: ffApiKey ? '***' : 'empty',
      ffSystemId,
    });

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
      console.error('[Forex Factory] Error linking account:', error);
      return { success: false, error: error.message };
    }

    console.log('[Forex Factory] Successfully linked account:', data);
    return { success: true, integration: data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Forex Factory] Error linking account:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get all Forex Factory integrations for a credential
 */
export async function getForexFactoryIntegrations(credentialId?: string): Promise<ForexFactoryIntegration[]> {
  try {
    let query = supabase.from('forex_factory_integrations').select('*');

    if (credentialId) {
      query = query.eq('credential_id', credentialId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Forex Factory integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching Forex Factory integrations:', error);
    return [];
  }
}

/**
 * Get all active Forex Factory integrations
 */
export async function getActiveForexFactoryIntegrations(): Promise<ForexFactoryIntegration[]> {
  try {
    const { data, error } = await supabase
      .from('forex_factory_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active Forex Factory integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active Forex Factory integrations:', error);
    return [];
  }
}

/**
 * Get Forex Factory integrations with credential details
 */
export async function getForexFactoryIntegrationsWithDetails(): Promise<
  (ForexFactoryIntegration & { credential?: { account_username: string; account_number: string } })[]
> {
  try {
    const { data: integrations, error: intError } = await supabase
      .from('forex_factory_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (intError) {
      console.error('Error fetching Forex Factory integrations:', intError);
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
    console.error('Error fetching Forex Factory integrations with details:', error);
    return [];
  }
}

/**
 * Update Forex Factory integration
 */
export async function updateForexFactoryIntegration(
  integrationId: string,
  updates: Partial<
    Omit<ForexFactoryIntegration, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'last_sync' | 'last_error'>
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('forex_factory_integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating Forex Factory integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating Forex Factory integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Delete Forex Factory integration
 */
export async function deleteForexFactoryIntegration(integrationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('forex_factory_integrations')
      .update({ is_active: false })
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting Forex Factory integration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting Forex Factory integration:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual Forex Factory sync for all integrations
 */
export async function triggerForexFactorySyncAll(): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  failed?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/sync/forex-factory/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    console.log('[Forex Factory Sync] Response:', { status: response.status, ok: response.ok, data });

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
    console.error('Error triggering Forex Factory sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger manual Forex Factory sync for specific integration
 */
export async function triggerForexFactorySyncIntegration(integrationId: string): Promise<{
  success: boolean;
  message?: string;
  synced?: number;
  error?: string;
}> {
  try {
    console.log(`[Forex Factory Sync] Triggering sync for integration: ${integrationId}`);

    const response = await fetch(`/api/sync/forex-factory/trigger/${integrationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    console.log('[Forex Factory Sync] Response:', { status: response.status, ok: response.ok, data });

    if (!response.ok) {
      const errorMsg = data.message || `HTTP ${response.status}`;
      console.error('[Forex Factory Sync] Request failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    // If backend returned success: false, convert to error
    if (!data.success) {
      const errorMsg = data.error || data.message || 'Sync failed - unknown error';
      console.error('[Forex Factory Sync] Backend returned success: false:', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log('[Forex Factory Sync] Sync successful!');
    return { success: true, ...data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Forex Factory Sync] Error triggering sync:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get recent Forex Factory sync history
 */
export async function getRecentForexFactorySyncs(
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

/**
 * Test Forex Factory connection with provided credentials
 */
export async function testForexFactoryConnection(
  ffAccountUsername: string,
  ffApiKey: string,
  ffSystemId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('[Forex Factory Test] Testing connection...');

    const response = await fetch('/api/sync/forex-factory/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ff_account_username: ffAccountUsername,
        ff_api_key: ffApiKey,
        ff_system_id: ffSystemId,
      }),
    });

    const data = await response.json();

    console.log('[Forex Factory Test] Response:', data);

    if (!response.ok) {
      return { success: false, message: data.message || 'Test failed' };
    }

    return { success: data.success, message: data.message };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Forex Factory Test] Error:', error);
    return { success: false, message: errorMsg };
  }
}
