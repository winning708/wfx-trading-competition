import { supabase } from './supabase';

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
): Promise<{ credential: TradingCredential | null; assignedTo?: string }> {
  try {
    // 1. Upload credential
    const { data: credentialData, error: credError } = await supabase
      .from('trading_credentials')
      .insert([credential])
      .select()
      .single();

    if (credError) {
      console.error('Error uploading credential:', credError);
      return { credential: null };
    }

    if (!credentialData) {
      console.error('No credential data returned');
      return { credential: null };
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
      console.error('Error assigning credential:', assignError);
      return { credential: credentialData };
    }

    console.log(`Credential assigned to ${targetTrader.full_name} (${targetTrader.email})`);
    return { credential: credentialData, assignedTo: targetTrader.full_name };
  } catch (error) {
    console.error('Error uploading credential:', error);
    return { credential: null };
  }
}

// Get all trading credentials
export async function getAllCredentials(): Promise<TradingCredential[]> {
  try {
    const { data, error } = await supabase
      .from('trading_credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credentials:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
}

// Get unassigned credentials
export async function getUnassignedCredentials(): Promise<TradingCredential[]> {
  try {
    const { data, error } = await supabase
      .from('trading_credentials')
      .select('*')
      .not('id', 'in', `(SELECT credential_id FROM credential_assignments WHERE credential_id IS NOT NULL)`)
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
): Promise<boolean> {
  try {
    // First, remove any existing assignment for this trader
    await supabase
      .from('credential_assignments')
      .delete()
      .eq('trader_id', traderId);

    // Then create new assignment
    const { error } = await supabase
      .from('credential_assignments')
      .insert([
        {
          trader_id: traderId,
          credential_id: credentialId,
        },
      ]);

    if (error) {
      console.error('Error assigning credential:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error assigning credential:', error);
    return false;
  }
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
export async function removeAssignment(assignmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('credential_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing assignment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing assignment:', error);
    return false;
  }
}

// Delete credential
export async function deleteCredential(credentialId: string): Promise<boolean> {
  try {
    // First remove all assignments
    await supabase
      .from('credential_assignments')
      .delete()
      .eq('credential_id', credentialId);

    // Then delete credential
    const { error } = await supabase
      .from('trading_credentials')
      .delete()
      .eq('id', credentialId);

    if (error) {
      console.error('Error deleting credential:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting credential:', error);
    return false;
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
