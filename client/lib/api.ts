import { supabase, Trader, TraderRegistration } from './supabase';

export async function getLeaderboard(): Promise<Trader[]> {
  try {
    const { data, error } = await supabase
      .from('performance_data')
      .select(`
        trader_id,
        starting_balance,
        current_balance,
        profit_percentage,
        rank,
        traders(full_name)
      `)
      .order('profit_percentage', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map((item: any, index: number) => ({
      rank: index + 1,
      username: item.traders?.full_name || 'Anonymous',
      startingBalance: item.starting_balance,
      currentBalance: item.current_balance,
      profitPercentage: item.profit_percentage,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function registerTrader(data: TraderRegistration): Promise<boolean> {
  try {
    // Insert trader registration
    const { data: traderData, error: traderError } = await supabase
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

    if (traderError) {
      console.error('Error registering trader:', traderError);
      return false;
    }

    if (!traderData || traderData.length === 0) {
      console.error('No trader data returned');
      return false;
    }

    const traderId = traderData[0].id;

    // Initialize performance data
    const { error: performanceError } = await supabase
      .from('performance_data')
      .insert([
        {
          trader_id: traderId,
          starting_balance: 1000.00,
          current_balance: 1000.00,
          profit_percentage: 0,
        },
      ]);

    if (performanceError) {
      console.error('Error initializing performance data:', performanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error registering trader:', error);
    return false;
  }
}

export async function getTraderCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('traders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching trader count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching trader count:', error);
    return 0;
  }
}
