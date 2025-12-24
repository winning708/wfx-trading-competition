import { supabase } from './supabase';

export interface TraderCredentials {
  trader_id: string;
  trader_name: string;
  trader_email: string;
  credential_id: string;
  account_username: string;
  account_password: string;
  account_number: string;
  broker: string;
  notes?: string;
}

/**
 * Fetch trader credentials by email
 * Used to display credentials on dashboard and after payment
 */
export async function getCredentialsByEmail(email: string): Promise<TraderCredentials | null> {
  try {
    if (!email) {
      console.error('[Credentials Display] Email is required');
      return null;
    }

    // First, get the trader by email
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('id, full_name, email')
      .eq('email', email)
      .single();

    if (traderError || !trader) {
      console.log('[Credentials Display] Trader not found for email:', email);
      return null;
    }

    // Then, get the credential assignment for this trader
    const { data: assignment, error: assignmentError } = await supabase
      .from('credential_assignments')
      .select('credential_id')
      .eq('trader_id', trader.id)
      .single();

    if (assignmentError || !assignment) {
      console.log('[Credentials Display] No credential assignment found for trader:', trader.id);
      return null;
    }

    // Finally, get the credential details
    const { data: credential, error: credentialError } = await supabase
      .from('trading_credentials')
      .select('id, account_username, account_password, account_number, broker, notes')
      .eq('id', assignment.credential_id)
      .single();

    if (credentialError || !credential) {
      console.error('[Credentials Display] Failed to fetch credential:', credentialError);
      return null;
    }

    return {
      trader_id: trader.id,
      trader_name: trader.full_name,
      trader_email: trader.email,
      credential_id: credential.id,
      account_username: credential.account_username,
      account_password: credential.account_password,
      account_number: credential.account_number,
      broker: credential.broker,
      notes: credential.notes,
    };
  } catch (error) {
    console.error('[Credentials Display] Error:', error);
    return null;
  }
}

/**
 * Extract email from payment reference
 * Format: "trader_email@domain.com_timestamp"
 */
export function extractEmailFromPaymentRef(ref: string): string | null {
  try {
    // Format: trader_email@domain.com_timestamp
    // We need to extract everything between "trader_" and the last "_" (timestamp)
    const match = ref.match(/^trader_(.+)_\d+$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('[Credentials Display] Error extracting email:', error);
    return null;
  }
}
