import { supabase } from './supabase';

// Log Supabase initialization
console.log('[Credentials] Supabase client initialized:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
});

export interface TradingCredential {
  id: string;
  account_username: string;
  account_password: string;
  account_number: string;
  broker: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CredentialAssignment {
  id: string;
  trader_id: string;
  credential_id: string;
  assigned_at: string;
  trader?: {
    full_name: string;
    email: string;
  };
  credential?: TradingCredential;
}

// Get unassigned traders (traders without credentials assigned)
async function getUnassignedTraders(): Promise<any[]> {
  try {
    const { data: allTraders, error: tradersError } = await supabase
      .from('traders')
      .select('id, full_name, email')
      .order('registered_at', { ascending: true });

    if (tradersError) {
      console.error('Error fetching traders:', tradersError);
      return [];
    }

    const { data: assignments, error: assignError } = await supabase
      .from('credential_assignments')
      .select('trader_id');

    if (assignError) {
      console.error('Error fetching assignments:', assignError);
      return [];
    }

    const assignedTraderIds = new Set(assignments?.map((a: any) => a.trader_id) || []);

    return (allTraders || []).filter((trader: any) => !assignedTraderIds.has(trader.id));
  } catch (error) {
    console.error('Error getting unassigned traders:', error);
    return [];
  }
}

// Upload a new trading credential and auto-assign to first unassigned trader
export async function uploadCredential(
  credential: Omit<TradingCredential, 'id' | 'created_at' | 'updated_at'>
): Promise<{ credential: TradingCredential | null; assignedTo?: string; error?: string }> {
  try {
    // 1. Upload credential
    const { data: credentialData, error: credError } = await supabase
      .from('trading_credentials')
      .insert([credential])
      .select()
      .single();

    if (credError) {
      const errorMsg = credError.message || JSON.stringify(credError);
      console.error('Error uploading credential:', errorMsg);
      return { credential: null, error: errorMsg };
    }

    if (!credentialData) {
      const msg = 'No credential data returned from database';
      console.error(msg);
      return { credential: null, error: msg };
    }

    // 2. Get unassigned traders
    const unassignedTraders = await getUnassignedTraders();

    if (unassignedTraders.length === 0) {
      console.warn('No unassigned traders available');
      return { credential: credentialData };
    }

    // 3. Assign to first unassigned trader
    const targetTrader = unassignedTraders[0];
    const { error: assignError } = await supabase
      .from('credential_assignments')
      .insert([
        {
          trader_id: targetTrader.id,
          credential_id: credentialData.id,
        },
      ]);

    if (assignError) {
      const errorMsg = assignError.message || JSON.stringify(assignError);
      console.error('Error assigning credential:', errorMsg);
      return { credential: credentialData };
    }

    console.log(`Credential assigned to ${targetTrader.full_name} (${targetTrader.email})`);

    // Note: Credentials are now displayed on the user's dashboard instead of being sent via email
    // No email notification is needed

    return { credential: credentialData, assignedTo: targetTrader.full_name };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error uploading credential:', errorMsg);
    return { credential: null, error: errorMsg };
  }
}

// Get all trading credentials
export async function getAllCredentials(): Promise<TradingCredential[]> {
  try {
    console.log('[getAllCredentials] Starting fetch...');
    const { data, error } = await supabase
      .from('trading_credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAllCredentials] Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      // Return empty array instead of throwing
      return [];
    }

    console.log('[getAllCredentials] Successfully fetched', (data || []).length, 'credentials');
    return data || [];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[getAllCredentials] Exception caught:', errorMsg, error);
    // Return empty array on any error to prevent app crash
    return [];
  }
}

// Get unassigned credentials
export async function getUnassignedCredentials(): Promise<TradingCredential[]> {
  try {
    const { data, error } = await supabase
      .from('trading_credentials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unassigned credentials:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching unassigned credentials:', error);
    return [];
  }
}

// Assign credential to trader
export async function assignCredentialToTrader(
  traderId: string,
  credentialId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!traderId || !credentialId) {
      const msg = 'Missing trader ID or credential ID';
      console.error('Error assigning credential:', msg);
      return { success: false, error: msg };
    }

    // First, remove any existing assignment for this trader
    const { error: deleteError } = await supabase
      .from('credential_assignments')
      .delete()
      .eq('trader_id', traderId);

    if (deleteError) {
      const errorMsg = deleteError.message || JSON.stringify(deleteError);
      console.error('Error removing old assignment:', errorMsg);
    }

    // Then create new assignment
    const { error: insertError } = await supabase
      .from('credential_assignments')
      .insert([
        {
          trader_id: traderId,
          credential_id: credentialId,
        },
      ]);

    if (insertError) {
      const errorMsg = insertError.message || JSON.stringify(insertError);
      console.error('Error assigning credential:', errorMsg);
      return {
        success: false,
        error: `Failed to assign credential: ${errorMsg}`
      };
    }

    // Note: Credentials are now displayed on the user's dashboard instead of being sent via email
    // No email notification is needed

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error assigning credential:', errorMsg);
    return {
      success: false,
      error: `Exception: ${errorMsg}`
    };
  }
}

/**
 * Send trading credentials email to a trader
 * NOTE: Email functionality has been removed. Credentials are now displayed on the user's dashboard.
 * This function is deprecated and kept only for backwards compatibility.
 */
export async function sendCredentialsEmailToTrader(traderId: string): Promise<boolean> {
  // Credentials are now displayed on the user's dashboard instead of being sent via email
  console.log('[Deprecated] sendCredentialsEmailToTrader called but email feature is disabled. Credentials are available on user dashboard.');
  return true;
}

// Get assignments with trader and credential details
export async function getAssignments(): Promise<CredentialAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('credential_assignments')
      .select(`
        id,
        trader_id,
        credential_id,
        assigned_at,
        traders(full_name, email),
        trading_credentials(*)
      `)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      trader_id: item.trader_id,
      credential_id: item.credential_id,
      assigned_at: item.assigned_at,
      trader: item.traders,
      credential: item.trading_credentials,
    }));
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

// Remove credential assignment
export async function removeAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('credential_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error('Error removing assignment:', errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error removing assignment:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Delete credential
export async function deleteCredential(credentialId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First remove all assignments
    const { error: deleteAssignError } = await supabase
      .from('credential_assignments')
      .delete()
      .eq('credential_id', credentialId);

    if (deleteAssignError) {
      console.error('Error deleting assignments:', deleteAssignError);
    }

    // Then delete credential
    const { error: deleteCredError } = await supabase
      .from('trading_credentials')
      .delete()
      .eq('id', credentialId);

    if (deleteCredError) {
      const errorMsg = deleteCredError.message || JSON.stringify(deleteCredError);
      console.error('Error deleting credential:', errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error deleting credential:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Update credential
export async function updateCredential(
  credentialId: string,
  updates: Partial<Omit<TradingCredential, 'id' | 'created_at' | 'updated_at'>>
): Promise<TradingCredential | null> {
  try {
    const { data, error } = await supabase
      .from('trading_credentials')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', credentialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating credential:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating credential:', error);
    return null;
  }
}
