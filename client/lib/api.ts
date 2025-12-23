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
      // Fetch performance data and join with traders
      const { data: result, error } = await supabase
        .from('performance_data')
        .select(
          `trader_id,
           starting_balance,
           current_balance,
           profit_percentage,
           traders(full_name)`
        )
        .order('profit_percentage', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase query error:', error.message, error);
        throw new Error(`Query failed: ${error.message}`);
      }

      console.log('Raw result from Supabase:', result);
      return result || [];
    }, 3, 500);

    if (!Array.isArray(data)) {
      console.error('Expected array from Supabase, got:', typeof data);
      return [];
    }

    const traders: Trader[] = data.map((item: any, index: number) => {
      let username = 'Anonymous';

      // Supabase returns nested objects for foreign keys
      if (item.traders && typeof item.traders === 'object') {
        username = item.traders.full_name || 'Anonymous';
      }

      return {
        rank: index + 1,
        username,
        startingBalance: parseFloat(String(item.starting_balance)) || 0,
        currentBalance: parseFloat(String(item.current_balance)) || 0,
        profitPercentage: parseFloat(String(item.profit_percentage)) || 0,
      };
    });

    console.log('Processed traders:', traders);
    return traders;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
}

export async function registerTrader(data: TraderRegistration): Promise<boolean> {
  try {
    // Insert trader registration with retry logic
    const traderData = await withRetry(async () => {
      const { data: result, error } = await supabase
        .from('traders')
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
            payment_method: data.paymentMethod,
            entry_fee_paid: true,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error registering trader:', error);
        throw new Error(error.message);
      }

      return result;
    }, 3, 500);

    if (!traderData || traderData.length === 0) {
      console.error('No trader data returned');
      return false;
    }

    const traderId = traderData[0].id;

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
        console.error('Supabase error initializing performance data:', error);
        throw new Error(error.message);
      }

      return true;
    }, 3, 500);

    return performanceResult;
  } catch (error) {
    console.error('Error registering trader:', error);
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
