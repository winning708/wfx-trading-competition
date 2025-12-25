import { supabase, Trader, TraderRegistration } from './supabase';

// Retry logic for failed requests
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed');
}

export async function getLeaderboard(): Promise<Trader[]> {
  try {
    const data = await withRetry(async () => {
      // Use raw SQL query to get leaderboard data
      const { data: result, error } = await supabase.rpc('get_leaderboard', {
        limit_count: 10,
      });

      if (error) {
        console.warn('RPC not available, falling back to table query:', error.message);

        // Fallback: fetch from tables directly
        const { data: perfData, error: perfError } = await supabase
          .from('performance_data')
          .select('*')
          .order('profit_percentage', { ascending: false })
          .limit(10);

        if (perfError) {
          console.error('Performance data query error:', perfError.message);
          throw new Error(`Query failed: ${perfError.message}`);
        }

        // Now fetch trader names
        if (!perfData || perfData.length === 0) {
          console.warn('No performance data found');
          return [];
        }

        const traderIds = perfData.map((p: any) => p.trader_id);
        const { data: traders, error: tradersError } = await supabase
          .from('traders')
          .select('id, full_name')
          .in('id', traderIds);

        if (tradersError) {
          console.error('Traders query error:', tradersError.message);
          throw new Error(`Traders query failed: ${tradersError.message}`);
        }

        const traderMap = new Map(traders?.map((t: any) => [t.id, t.full_name]) || []);

        return perfData.map((item: any) => ({
          trader_id: item.trader_id,
          starting_balance: item.starting_balance,
          current_balance: item.current_balance,
          profit_percentage: item.profit_percentage,
          trader_name: traderMap.get(item.trader_id) || 'Anonymous',
        }));
      }

      console.log('RPC result:', result);
      return result || [];
    }, 3, 500);

    if (!Array.isArray(data)) {
      console.error('Expected array from query, got:', typeof data);
      return [];
    }

    const traders: Trader[] = data.map((item: any, index: number) => {
      // Handle both RPC and fallback response formats
      let username = item.trader_name || (item.traders?.full_name) || 'Anonymous';

      return {
        rank: index + 1,
        id: item.trader_id || item.id,
        username,
        email: item.email || item.traders?.email,
        startingBalance: parseFloat(String(item.starting_balance)) || 0,
        currentBalance: parseFloat(String(item.current_balance)) || 0,
        profitPercentage: parseFloat(String(item.profit_percentage)) || 0,
      };
    });

    console.log('Final leaderboard traders:', traders);
    return traders;
  } catch (error) {
    console.error('Fatal error in getLeaderboard:', error);
    return [];
  }
}

export async function registerTrader(data: TraderRegistration): Promise<boolean> {
  try {
    console.log('[registerTrader] Attempting to register trader:', { email: data.email, fullName: data.fullName });

    // First, check if trader already exists with this email
    const { data: existingTraders, error: checkError } = await supabase
      .from('traders')
      .select('id, email, entry_fee_paid')
      .eq('email', data.email);

    if (checkError) {
      console.error('[registerTrader] Error checking for existing trader:', checkError);
      throw new Error(`Failed to check existing trader: ${checkError.message}`);
    }

    if (existingTraders && existingTraders.length > 0) {
      const existingTrader = existingTraders[0];
      console.log('[registerTrader] Trader already exists:', { email: data.email, id: existingTrader.id, entry_fee_paid: existingTrader.entry_fee_paid });

      // If they already registered and paid, just return success
      if (existingTrader.entry_fee_paid) {
        console.log('[registerTrader] ✅ Trader already registered and paid, returning success');
        return true;
      }

      // If they exist but haven't paid, update their payment status
      console.log('[registerTrader] Updating existing trader payment status');
      const { error: updateError } = await supabase
        .from('traders')
        .update({
          entry_fee_paid: true,
          payment_method: data.paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingTrader.id);

      if (updateError) {
        console.error('[registerTrader] Error updating trader:', updateError);
        throw new Error(`Failed to update trader: ${updateError.message}`);
      }

      console.log('[registerTrader] ✅ Trader payment status updated');
      return true;
    }

    // Trader doesn't exist, create new one
    console.log('[registerTrader] Creating new trader');
    const traderData = await withRetry(async () => {
      const { data: result, error } = await supabase
        .from('traders')
        .insert([
          {
            username: data.username,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
            trader_password: data.password,
            payment_method: data.paymentMethod,
            entry_fee_paid: true,
            payment_status: 'pending',
          },
        ])
        .select();

      if (error) {
        console.error('[registerTrader] Supabase error inserting trader:', error);
        throw new Error(error.message);
      }

      return result;
    }, 3, 500);

    if (!traderData || traderData.length === 0) {
      console.error('[registerTrader] No trader data returned from insert');
      return false;
    }

    const traderId = traderData[0].id;
    console.log('[registerTrader] ✅ New trader created:', { id: traderId, email: data.email });

    // Initialize performance data with retry logic
    const performanceResult = await withRetry(async () => {
      const { error } = await supabase
        .from('performance_data')
        .insert([
          {
            trader_id: traderId,
            starting_balance: 1000.0,
            current_balance: 1000.0,
            profit_percentage: 0,
          },
        ]);

      if (error) {
        console.error('[registerTrader] Supabase error initializing performance data:', error);
        throw new Error(error.message);
      }

      return true;
    }, 3, 500);

    console.log('[registerTrader] ✅ Registration complete, performance data initialized');
    return performanceResult;
  } catch (error) {
    console.error('[registerTrader] ❌ Error registering trader:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function getTraderCount(): Promise<number> {
  try {
    const result = await withRetry(async () => {
      const { count, error } = await supabase
        .from('traders')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase error fetching trader count:', error);
        throw new Error(error.message);
      }

      return count;
    }, 3, 500);

    return result || 0;
  } catch (error) {
    console.error('Error fetching trader count:', error);
    return 0;
  }
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentData?: {
    public_key: string;
    email: string;
    amount: number;
    fullName: string;
    txRef: string;
    currency: string;
    redirect_url: string;
    cancelUrl: string;
  } | {
    type: 'manual';
    method: string;
    merchantId?: string;
    walletAddress?: string;
    orderRef: string;
    email: string;
    amount: number;
    fullName: string;
    currency: string;
    instructions: string;
    confirmUrl: string;
  };
  message?: string;
}

export async function initiatePayment(
  paymentMethod: string,
  email: string,
  amount: number,
  fullName: string
): Promise<PaymentInitiationResponse> {
  try {
    const endpoint = paymentMethod === 'flutterwave'
      ? '/api/payment/initiate/flutterwave'
      : paymentMethod === 'binance'
      ? '/api/payment/initiate/binance'
      : '/api/payment/initiate/bybit';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount, fullName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as PaymentInitiationResponse;
    return data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to initiate payment',
    };
  }
}

export interface AdminPaymentSettings {
  id?: string;
  nigerian_bank_name?: string;
  nigerian_account_name?: string;
  nigerian_account_number?: string;
  nigerian_swift_code?: string;
  binance_pay_id?: string;
  binance_network?: string;
  bybit_wallet_address?: string;
  bybit_network?: string;
}

/**
 * Get admin payment settings (bank account, crypto wallets, etc.)
 */
export async function getPaymentSettings(): Promise<AdminPaymentSettings | null> {
  try {
    const response = await fetch('/api/admin/payment-settings');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.settings || null;
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return null;
  }
}

/**
 * Update admin payment settings
 */
export async function updatePaymentSettings(
  settings: AdminPaymentSettings
): Promise<{ success: boolean; message?: string; settings?: AdminPaymentSettings }> {
  try {
    const response = await fetch('/api/admin/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update payment settings',
    };
  }
}

/**
 * Delete a trader
 */
export async function deleteTrader(traderId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`/api/admin/traders/${traderId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting trader:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete trader',
    };
  }
}
