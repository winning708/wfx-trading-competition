import { supabase } from './supabase';

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  traderCount: number;
  performanceDataCount: number;
  error?: string;
}> {
  try {
    // Test 1: Check traders table
    const { count: traderCount, error: tradersError } = await supabase
      .from('traders')
      .select('*', { count: 'exact', head: true });

    if (tradersError) throw new Error(`Traders error: ${tradersError.message}`);

    // Test 2: Check performance_data table
    const { count: performanceCount, error: performanceError } = await supabase
      .from('performance_data')
      .select('*', { count: 'exact', head: true });

    if (performanceError) throw new Error(`Performance error: ${performanceError.message}`);

    return {
      connected: true,
      traderCount: traderCount || 0,
      performanceDataCount: performanceCount || 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      traderCount: 0,
      performanceDataCount: 0,
      error: errorMsg,
    };
  }
}
