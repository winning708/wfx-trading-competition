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
      // Fetch performance_data with trader information via foreign key
      const { data: result, error } = await supabase
        .from('performance_data')
        .select(`
          trader_id,
          starting_balance,
          current_balance,
          profit_percentage,
          traders!inner(full_name)
        `)
        .order('profit_percentage', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase select error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!result || result.length === 0) {
        console.warn('No performance data found in Supabase');
      } else {
        console.log('Successfully fetched from Supabase:', result.length, 'traders');
      }

      return result || [];
    }, 3, 500);

    const traders = data.map((item: any, index: number) => {
      // Handle both object and array formats for nested data
      let traderName = 'Anonymous';
      if (item.traders) {
        if (Array.isArray(item.traders) && item.traders[0]) {
          traderName = item.traders[0].full_name || 'Anonymous';
        } else if (typeof item.traders === 'object' && item.traders.full_name) {
          traderName = item.traders.full_name;
        }
      }

      return {
        rank: index + 1,
        username: traderName,
        startingBalance: Number(item.starting_balance),
        currentBalance: Number(item.current_balance),
        profitPercentage: Number(item.profit_percentage),
      };
    });

    console.log('Final leaderboard:', traders);
    return traders;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
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
