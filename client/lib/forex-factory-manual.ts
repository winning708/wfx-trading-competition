/**
 * Forex Factory Manual Data Upload
 * Allows admins to manually upload trader data from Forex Factory CSV
 */

import { supabase } from './supabase';

export interface ForexFactoryTraderData {
  rank: number;
  trader_name: string;
  trader_username: string;
  balance: number;
  profit_percent: number;
  trades: number;
}

/**
 * Parse CSV data from text input
 * Expected format:
 * rank,trader_name,trader_username,balance,profit_percent,trades
 * 1,John Doe,johndoe,25000,45.5,120
 */
export function parseForexFactoryCSV(csvText: string): ForexFactoryTraderData[] {
  const lines = csvText.trim().split('\n');
  const traders: ForexFactoryTraderData[] = [];

  // Skip header line if present
  const startIndex = lines[0].toLowerCase().includes('rank') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 6) {
      console.warn(`[Forex Factory Parser] Skipping invalid line ${i + 1}: ${line}`);
      continue;
    }

    try {
      const trader: ForexFactoryTraderData = {
        rank: parseInt(parts[0]),
        trader_name: parts[1],
        trader_username: parts[2],
        balance: parseFloat(parts[3]),
        profit_percent: parseFloat(parts[4]),
        trades: parseInt(parts[5]),
      };

      // Validate data
      if (!trader.trader_name || !trader.trader_username || isNaN(trader.balance)) {
        console.warn(`[Forex Factory Parser] Skipping line with invalid data: ${line}`);
        continue;
      }

      traders.push(trader);
    } catch (error) {
      console.warn(`[Forex Factory Parser] Error parsing line ${i + 1}:`, error);
      continue;
    }
  }

  console.log(`[Forex Factory Parser] Successfully parsed ${traders.length} traders from CSV`);
  return traders;
}

/**
 * Upload trader data and update leaderboard
 * Creates/updates trader records with Forex Factory credentials
 */
export async function uploadForexFactoryTraderData(
  traders: ForexFactoryTraderData[],
  credentialId: string
): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let updatedCount = 0;

  for (const trader of traders) {
    try {
      // Normalize names - trim whitespace and handle special cases
      const normalizedUsername = trader.trader_username.trim();
      const normalizedName = trader.trader_name.trim();

      console.log(`[Forex Factory Upload] Processing trader: "${normalizedName}" (username: "${normalizedUsername}")`);

      // 1. Try to find or create trading_credentials record with Forex Factory info
      const { data: credData, error: credError } = await supabase
        .from('trading_credentials')
        .select('id')
        .eq('id', credentialId)
        .single();

      if (credError) {
        const msg = `Credential ${credentialId} not found`;
        console.error(`[Forex Factory Upload] ${msg}`);
        errors.push(msg);
        continue;
      }

      // 2. Find trader by username or name
      // First, fetch all traders (simpler approach to avoid filter issues)
      const { data: allTraders, error: allTradersError } = await supabase
        .from('traders')
        .select('id, full_name, current_balance');

      if (allTradersError) {
        const msg = `Failed to fetch traders: ${allTradersError.message}`;
        console.error(`[Forex Factory Upload] ${msg}`);
        errors.push(msg);
        continue;
      }

      let targetTrader = null;

      if (allTraders && allTraders.length > 0) {
        // Try exact case-insensitive match on full name first
        targetTrader = allTraders.find(t =>
          t.full_name.toLowerCase() === normalizedName.toLowerCase()
        );

        // If not found, try partial match on username
        if (!targetTrader) {
          targetTrader = allTraders.find(t =>
            t.full_name.toLowerCase().includes(normalizedUsername.toLowerCase())
          );
        }

        // If not found, try partial match on full name
        if (!targetTrader) {
          targetTrader = allTraders.find(t =>
            t.full_name.toLowerCase().includes(normalizedName.toLowerCase())
          );
        }
      }

      if (!targetTrader) {
        const traderList = allTraders?.map(t => `"${t.full_name}"`).join(', ') || 'none';
        const msg = `Trader "${normalizedName}" not found in system. Available traders: ${traderList}`;
        console.warn(`[Forex Factory Upload] ${msg}`);
        errors.push(msg);
        continue;
      }

      console.log(`[Forex Factory Upload] ✓ Found trader: "${targetTrader.full_name}"`)

      console.log(`[Forex Factory Upload] Found trader: ${targetTrader.full_name}`);

      // 3. Update performance data
      const startingBalance = 10000; // Default starting balance
      const currentBalance = trader.balance;
      const profitAmount = currentBalance - startingBalance;
      const profitPercent = (profitAmount / startingBalance) * 100;

      const { error: updateError } = await supabase
        .from('leaderboard_performance')
        .upsert([
          {
            trader_id: targetTrader.id,
            starting_balance: startingBalance,
            current_balance: currentBalance,
            profit_amount: profitAmount,
            profit_percent: profitPercent || trader.profit_percent,
            data_source: 'forex_factory_manual',
            last_updated: new Date().toISOString(),
          },
        ], { onConflict: 'trader_id' });

      if (updateError) {
        const msg = `Failed to update ${trader.trader_name}: ${updateError.message}`;
        console.error(`[Forex Factory Upload] ${msg}`);
        errors.push(msg);
        continue;
      }

      // 4. Create/update Forex Factory integration record
      const { error: integrationError } = await supabase
        .from('forex_factory_integrations')
        .upsert([
          {
            credential_id: credentialId,
            trader_id: targetTrader.id,
            ff_account_username: trader.trader_username,
            ff_api_key: 'manual_input',
            ff_system_id: `trader_${trader.rank}`,
            sync_status: 'manual_success',
            last_sync: new Date().toISOString(),
            is_active: true,
          },
        ], { onConflict: 'trader_id' });

      if (integrationError) {
        console.warn(`[Forex Factory Upload] Could not create integration record:`, integrationError);
        // Don't fail the whole import, this is optional
      }

      console.log(`[Forex Factory Upload] ✓ Updated ${trader.trader_name}`);
      updatedCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Forex Factory Upload] Exception:`, errorMsg);
      errors.push(`Exception updating ${trader.trader_name}: ${errorMsg}`);
    }
  }

  console.log(
    `[Forex Factory Upload] Complete: ${updatedCount}/${traders.length} traders updated, ${errors.length} errors`
  );

  return {
    success: updatedCount > 0,
    updatedCount,
    errors,
  };
}

/**
 * Generate CSV template for user to fill in
 */
export function generateCSVTemplate(): string {
  return `rank,trader_name,trader_username,balance,profit_percent,trades
1,John Doe,johndoe,25000,45.5,120
2,Jane Smith,janesmith,22000,40.2,110
3,Robert Johnson,rjohnson,20500,38.1,105
4,Sarah Williams,swilliams,19200,35.8,98
5,Michael Brown,mbrown,18500,34.2,92
6,Emily Davis,edavis,17800,32.5,87
7,David Miller,dmiller,17000,31.0,82
8,Lisa Anderson,landerson,16200,29.5,78
9,James Taylor,jtaylor,15500,28.0,75
10,Patricia White,pwhite,14800,26.5,72`;
}
