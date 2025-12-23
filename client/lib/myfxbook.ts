import { supabase } from './supabase';

export interface MyFXBookIntegration {
  id: string;
  credential_id: string;
  myfxbook_account_id: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  last_sync?: string;
  last_error?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncHistory {
  id: string;
  integration_id: string;
  sync_type: 'automatic' | 'manual';
  status: 'pending' | 'in_progress' | 'success' | 'error';
  records_updated: number;
  error_message?: string;
  synced_at: string;
}

// Link a credential to MyFXBook account
export async function linkMyFXBook(
  credentialId: string,
  myfxbookAccountId: string,
  myfxbookPassword: string
): Promise<MyFXBookIntegration | null> {
  try {
    const { data, error } = await supabase
      .from('myfxbook_integrations')
      .insert([
        {
          credential_id: credentialId,
          myfxbook_account_id: myfxbookAccountId,
          myfxbook_password: myfxbookPassword,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error linking MyFXBook:', error.message, error);
      return null;
    }

    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error linking MyFXBook:', errorMsg);
    return null;
  }
}

// Get all MyFXBook integrations
export async function getMyFXBookIntegrations(): Promise<MyFXBookIntegration[]> {
  try {
    const { data, error } = await supabase
      .from('myfxbook_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error.message, error);
      return [];
    }

    return data || [];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching integrations:', errorMsg);
    return [];
  }
}

// Get integrations with credential details
export async function getMyFXBookIntegrationsWithDetails(): Promise<any[]> {
  try {
    // Fetch integrations
    const { data, error } = await supabase
      .from('myfxbook_integrations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations with details:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch credential details for each integration
    const credentialIds = data.map((i: any) => i.credential_id);
    const { data: credentials, error: credError } = await supabase
      .from('trading_credentials')
      .select('id, account_username, account_number')
      .in('id', credentialIds);

    if (credError) {
      console.error('Error fetching credentials:', credError);
      // Return integrations without credential details
      return data;
    }

    // Create a map of credentials by ID
    const credentialMap = new Map(
      (credentials || []).map((c: any) => [c.id, c])
    );

    // Merge credential data into integrations
    const mergedData = data.map((integration: any) => ({
      ...integration,
      credential: credentialMap.get(integration.credential_id),
    }));

    return mergedData;
  } catch (error) {
    console.error('Error fetching integrations with details:', error);
    return [];
  }
}

// Trigger manual sync for a specific integration
export async function triggerManualSync(integrationId: string): Promise<boolean> {
  try {
    // Create sync history record
    const { data: syncRecord, error: historyError } = await supabase
      .from('sync_history')
      .insert([
        {
          integration_id: integrationId,
          sync_type: 'manual',
          status: 'in_progress',
        },
      ])
      .select()
      .single();

    if (historyError) {
      console.error('Error creating sync history:', historyError.message, historyError);
      return false;
    }

    // Update integration status
    const { error: updateError } = await supabase
      .from('myfxbook_integrations')
      .update({
        sync_status: 'syncing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (updateError) {
      console.error('Error updating integration status:', updateError.message, updateError);
      return false;
    }

    console.log('Manual sync triggered for integration:', integrationId);

    // In a real implementation, this would call your backend API
    // to fetch data from MyFXBook and update performance_data
    // For now, we'll just return true to indicate the sync was initiated
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error triggering manual sync:', errorMsg);
    return false;
  }
}

// Trigger sync for all integrations
export async function triggerSyncAll(): Promise<number> {
  try {
    const integrations = await getMyFXBookIntegrations();
    let syncedCount = 0;

    for (const integration of integrations) {
      const success = await triggerManualSync(integration.id);
      if (success) syncedCount++;
    }

    return syncedCount;
  } catch (error) {
    console.error('Error triggering sync all:', error);
    return 0;
  }
}

// Get sync history for an integration
export async function getSyncHistory(
  integrationId: string,
  limit: number = 10
): Promise<SyncHistory[]> {
  try {
    const { data, error } = await supabase
      .from('sync_history')
      .select('*')
      .eq('integration_id', integrationId)
      .order('synced_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync history:', error.message, error);
      return [];
    }

    return data || [];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching sync history:', errorMsg);
    return [];
  }
}

// Get recent syncs
export async function getRecentSyncs(limit: number = 20): Promise<SyncHistory[]> {
  try {
    const { data, error } = await supabase
      .from('sync_history')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent syncs:', error.message, error);
      return [];
    }

    return data || [];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching recent syncs:', errorMsg);
    return [];
  }
}

// Update sync status (called by backend after sync completes)
export async function updateSyncStatus(
  integrationId: string,
  status: 'success' | 'error',
  recordsUpdated?: number,
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('myfxbook_integrations')
      .update({
        sync_status: status,
        last_sync: new Date().toISOString(),
        last_error: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating sync status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating sync status:', error);
    return false;
  }
}

// Delete MyFXBook integration
export async function deleteMyFXBookIntegration(integrationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('myfxbook_integrations')
      .update({ is_active: false })
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting integration:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting integration:', error);
    return false;
  }
}
