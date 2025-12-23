/**
 * Forex Factory Trade Explorer REST API Client
 * Uses RapidAPI's Forex Factory Scraper for real-time leaderboard data
 * 
 * Fetches trading performance data for syncing to leaderboard
 */

export interface ForexFactoryAccountData {
  accountId: string;
  balance: number;
  equity: number;
  profit: number;
  trades: number;
  winRate: number;
  drawdown: number;
  currency: string;
}

export interface SyncResult {
  success: boolean;
  accountId: string;
  currentBalance: number;
  profitAmount: number;
  profitPercentage: number;
  currency: string;
  error?: string;
}

/**
 * RapidAPI Leaderboard Entry
 * Response format from RapidAPI Forex Factory Scraper
 */
interface RapidAPILeaderboardEntry {
  rank?: number | string;
  explorer?: string;
  name?: string;
  return?: string | number;
  pips?: string | number;
  draws?: string | number;
  url?: string;
  [key: string]: any;
}

/**
 * Fetch account data from RapidAPI Forex Factory Scraper
 * 
 * @param accountUsername - Forex Factory account username / trader name
 * @param rapidapiKey - RapidAPI API key
 * @param systemId - The specific trading system/account ID to track (optional filter)
 * @returns Account data or null if error
 */
export async function fetchForexFactoryAccountData(
  accountUsername: string,
  rapidapiKey: string,
  systemId: string
): Promise<ForexFactoryAccountData | null> {
  try {
    console.log(`[Forex Factory] ============ FETCH STARTING ============`);
    console.log(`[Forex Factory] Account Username: ${accountUsername}`);
    console.log(`[Forex Factory] System ID: ${systemId}`);
    console.log(`[Forex Factory] RapidAPI Key length: ${rapidapiKey.length}`);

    // Validate inputs
    if (!accountUsername || !rapidapiKey || !systemId) {
      const errorMsg = 'Missing required Forex Factory configuration: account username, RapidAPI key, or system ID';
      console.error(`[Forex Factory] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // RapidAPI Forex Factory Scraper endpoint
    const apiUrl = 'https://forex-factory-scraper1.p.rapidapi.com/forex-leaderboard';

    console.log(`[Forex Factory] Making request to: ${apiUrl}`);
    console.log(`[Forex Factory] RapidAPI Key provided: ${rapidapiKey ? 'Yes (length: ' + rapidapiKey.length + ')' : 'No'}`);

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidapiKey,
          'x-rapidapi-host': 'forex-factory-scraper1.p.rapidapi.com',
          'Accept': 'application/json',
        },
      });

      console.log(`[Forex Factory] Response status: ${response.status}`);
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
      console.error(`[Forex Factory] Network error fetching from ${apiUrl}: ${errorMsg}`);
      console.error(`[Forex Factory] Common causes:`);
      console.error(`[Forex Factory]   1. RapidAPI key is invalid or expired`);
      console.error(`[Forex Factory]   2. RapidAPI service is unreachable`);
      console.error(`[Forex Factory]   3. Network connectivity issue`);
      throw new Error(`Network error: ${errorMsg}`);
    }

    if (!response.ok) {
      const responseText = await response.text();

      if (response.status === 401) {
        console.error('[Forex Factory] HTTP 401: Invalid RapidAPI key');
        throw new Error('Invalid RapidAPI key. Please check your key in RapidAPI dashboard.');
      }

      console.error(`[Forex Factory] HTTP Error ${response.status}: ${responseText.substring(0, 200)}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const responseText = await response.text();
      console.error(`[Forex Factory] Failed to parse JSON response: ${responseText.substring(0, 200)}`);
      throw new Error(`Invalid JSON response from RapidAPI`);
    }

    // Search for the trader in the leaderboard data
    const accountData = findAndNormalizeTraderData(data, accountUsername, systemId);

    if (!accountData) {
      console.error('[Forex Factory] Failed to find trader in leaderboard data');
      throw new Error(`Trader "${accountUsername}" not found in Forex Factory leaderboard. Please verify the username is correct.`);
    }

    console.log(`[Forex Factory] Successfully fetched data for account: ${accountUsername}`);
    console.log(`[Forex Factory] Balance: ${accountData.balance}, Return: ${accountData.profit}%`);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Error fetching account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Find trader in leaderboard data and normalize to our format
 * RapidAPI returns leaderboard entries, we search for the matching trader
 * 
 * Expected RapidAPI response format:
 * [
 *   {
 *     "rank": "1",
 *     "explorer": "system_name",
 *     "name": "trader_name",
 *     "return": "45.23",
 *     "pips": "1250",
 *     "draws": "3",
 *     "url": "https://www.forexfactory.com/..."
 *   }
 * ]
 */
function findAndNormalizeTraderData(
  leaderboardData: any,
  accountUsername: string,
  systemId: string
): ForexFactoryAccountData | null {
  try {
    // Ensure we have an array
    const entries: RapidAPILeaderboardEntry[] = Array.isArray(leaderboardData) ? leaderboardData : [];

    if (entries.length === 0) {
      console.error('[Forex Factory] Leaderboard data is empty');
      return null;
    }

    console.log(`[Forex Factory] Searching through ${entries.length} leaderboard entries`);

    // Search for trader by username (case-insensitive)
    const trader = entries.find((entry) => {
      const entryName = (entry.name || entry.explorer || '').toLowerCase();
      const searchName = accountUsername.toLowerCase();
      return entryName.includes(searchName) || searchName.includes(entryName);
    });

    if (!trader) {
      console.error(`[Forex Factory] Trader "${accountUsername}" not found in leaderboard`);
      console.error('[Forex Factory] Available traders:', entries.slice(0, 5).map((e) => e.name || e.explorer));
      return null;
    }

    console.log('[Forex Factory] Found trader in leaderboard:', trader.name || trader.explorer);

    // Parse return percentage
    const returnValue = parseFloat(String(trader.return || 0).replace('%', '')) || 0;
    
    // Parse pips
    const pips = parseInt(String(trader.pips || 0)) || 0;

    // Create account data object
    const accountData: ForexFactoryAccountData = {
      accountId: systemId,
      balance: 10000 + (returnValue * 100), // Estimate balance from return percentage
      equity: 10000 + (returnValue * 100),
      profit: returnValue * 100,
      trades: pips > 0 ? Math.max(1, Math.floor(Math.abs(pips) / 50)) : 0,
      winRate: 0.5, // Default win rate
      drawdown: 0, // RapidAPI doesn't provide drawdown
      currency: 'USD',
    };

    console.log('[Forex Factory] Normalized account data:', accountData);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Error normalizing trader data: ${errorMsg}`);
    return null;
  }
}

/**
 * Calculate profit percentage from balance data
 * @param balance - Current account balance
 * @param startBalance - Starting balance
 * @returns Profit percentage
 */
export function calculateProfitPercentage(
  balance: number,
  startBalance: number
): number {
  if (startBalance === 0) return 0;
  return ((balance - startBalance) / startBalance) * 100;
}

/**
 * Sync account data from Forex Factory and return formatted result
 * @param accountUsername - Forex Factory account username
 * @param rapidapiKey - RapidAPI key
 * @param systemId - Trading system ID to sync
 * @param expectedStartBalance - Expected starting balance for validation
 * @returns SyncResult with balance and profit data
 */
export async function syncForexFactoryAccount(
  accountUsername: string,
  rapidapiKey: string,
  systemId: string,
  expectedStartBalance: number = 10000
): Promise<SyncResult> {
  const accountData = await fetchForexFactoryAccountData(accountUsername, rapidapiKey, systemId);

  if (!accountData) {
    return {
      success: false,
      accountId: systemId,
      currentBalance: 0,
      profitAmount: 0,
      profitPercentage: 0,
      currency: 'USD',
      error: 'Failed to fetch account data from Forex Factory',
    };
  }

  const currentBalance = accountData.balance;
  const profitAmount = currentBalance - expectedStartBalance;
  const profitPercentage = calculateProfitPercentage(currentBalance, expectedStartBalance);

  return {
    success: true,
    accountId: systemId,
    currentBalance,
    profitAmount,
    profitPercentage,
    currency: accountData.currency || 'USD',
  };
}

/**
 * Test Forex Factory connection with RapidAPI
 * Verifies that the RapidAPI key is valid and can reach the service
 * @param accountUsername - Forex Factory account username
 * @param rapidapiKey - RapidAPI key
 * @param systemId - Trading system ID to verify
 * @returns { success: boolean; message?: string }
 */
export async function testForexFactoryConnection(
  accountUsername: string,
  rapidapiKey: string,
  systemId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`[Forex Factory] Testing connection for account: ${accountUsername}`);
    console.log(`[Forex Factory] Using system ID: ${systemId}`);

    const accountData = await fetchForexFactoryAccountData(accountUsername, rapidapiKey, systemId);

    if (!accountData) {
      console.error('[Forex Factory] Connection test failed: invalid account data');
      return {
        success: false,
        message: 'Could not fetch account data. Possible causes:\n1. Invalid Forex Factory account username\n2. RapidAPI key is expired or invalid\n3. Trader not found in leaderboard\n4. RapidAPI service is unavailable'
      };
    }

    console.log(`[Forex Factory] Connection test successful for account: ${accountUsername}`);
    console.log(`[Forex Factory] Account data: Balance=${accountData.balance}, Profit=${accountData.profit}%`);
    return {
      success: true,
      message: `Successfully connected! Trader "${accountUsername}" found with return: ${accountData.profit.toFixed(2)}%`
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Connection test failed: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }
}
