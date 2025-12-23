/**
 * Forex Factory Trade Explorer REST API Client
 * Handles communication with Forex Factory Trade Explorer accounts
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
 * Fetch account data from Forex Factory Trade Explorer
 * 
 * @param accountUsername - Forex Factory account username
 * @param apiKey - Forex Factory API key (if using API)
 * @param systemId - The specific trading system/account ID to track
 * @returns Account data or null if error
 */
export async function fetchForexFactoryAccountData(
  accountUsername: string,
  apiKey: string,
  systemId: string
): Promise<ForexFactoryAccountData | null> {
  try {
    console.log(`[Forex Factory] ============ FETCH STARTING ============`);
    console.log(`[Forex Factory] Account Username: ${accountUsername}`);
    console.log(`[Forex Factory] System ID: ${systemId}`);
    console.log(`[Forex Factory] API Key length: ${apiKey.length}`);

    // Validate inputs
    if (!accountUsername || !apiKey || !systemId) {
      const errorMsg = 'Missing required Forex Factory configuration: account username, API key, or system ID';
      console.error(`[Forex Factory] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Build API request URL
    // Forex Factory Trade Explorer API format: https://api.forexfactory.com/v1/accounts/{systemId}/stats
    const apiUrl = `https://api.forexfactory.com/v1/accounts/${systemId}/stats`;

    console.log(`[Forex Factory] Making request to: ${apiUrl}`);
    console.log(`[Forex Factory] API Key provided: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`);

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'WFX-Trading-Bot/1.0',
        },
      });

      console.log(`[Forex Factory] Response status: ${response.status}`);
      console.log(`[Forex Factory] Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
      console.error(`[Forex Factory] Network error fetching from ${apiUrl}: ${errorMsg}`);
      console.error(`[Forex Factory] Common causes:`);
      console.error(`[Forex Factory]   1. Account username or System ID is incorrect`);
      console.error(`[Forex Factory]   2. API key is invalid or expired`);
      console.error(`[Forex Factory]   3. Forex Factory server is unreachable`);
      console.error(`[Forex Factory]   4. Network connectivity issue`);
      throw new Error(`Network error: ${errorMsg}`);
    }

    if (!response.ok) {
      const responseText = await response.text();

      // Check if response is HTML (likely an error page)
      if (responseText.trim().startsWith('<')) {
        const htmlPreview = responseText.substring(0, 200).replace(/\n/g, ' ');
        console.error(`[Forex Factory] HTTP ${response.status}: Received HTML instead of JSON`);
        console.error(`[Forex Factory] Preview: ${htmlPreview}`);
        throw new Error(`HTTP ${response.status}: Server returned HTML. Check if system ID and API key are correct.`);
      }

      console.error(`[Forex Factory] HTTP Error ${response.status}: ${responseText.substring(0, 200)}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const responseText = await response.text();

      if (responseText.trim().startsWith('<')) {
        const htmlPreview = responseText.substring(0, 200).replace(/\n/g, ' ');
        console.error(`[Forex Factory] Received HTML instead of JSON: ${htmlPreview}`);
        throw new Error(`Invalid JSON response: Server returned HTML instead of JSON.`);
      }

      console.error(`[Forex Factory] Failed to parse JSON response: ${responseText.substring(0, 200)}`);
      throw new Error(`Invalid JSON response from Forex Factory API`);
    }

    // Normalize response data
    const accountData = normalizeForexFactoryData(data, accountUsername, systemId);

    if (!accountData) {
      console.error('[Forex Factory] Failed to normalize account data');
      throw new Error('Invalid account data format from Forex Factory');
    }

    console.log(`[Forex Factory] Successfully fetched data for account: ${accountUsername}`);
    console.log(`[Forex Factory] Balance: ${accountData.balance}, Equity: ${accountData.equity}, Profit: ${accountData.profit}`);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Error fetching account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Normalize account data from Forex Factory Trade Explorer API
 * Handles various response formats from Forex Factory
 * 
 * Expected Forex Factory response format:
 * {
 *   "account_id": "system_id",
 *   "username": "account_username",
 *   "balance": 10500.00,
 *   "equity": 10250.00,
 *   "profit": 250.00,
 *   "total_trades": 145,
 *   "win_rate": 0.65,
 *   "drawdown": 0.12,
 *   "currency": "USD"
 * }
 */
function normalizeForexFactoryData(
  data: any,
  accountUsername: string,
  systemId: string
): ForexFactoryAccountData | null {
  try {
    // Extract fields with fallbacks
    const accountData: ForexFactoryAccountData = {
      accountId: data.account_id || data.id || data.system_id || systemId,
      balance: parseFloat(data.balance || data.current_balance || 0) || 1000,
      equity: parseFloat(data.equity || data.current_balance || 0) || 1000,
      profit: parseFloat(data.profit || data.total_profit || 0) || 0,
      trades: parseInt(data.total_trades || data.trades || 0) || 0,
      winRate: parseFloat(data.win_rate || data.winrate || 0) || 0,
      drawdown: parseFloat(data.drawdown || data.max_drawdown || 0) || 0,
      currency: data.currency || 'USD',
    };

    // Validate required fields
    if (!accountData.balance || accountData.balance === 0) {
      console.warn('[Forex Factory] Warning: Balance is 0 or missing, using default');
      accountData.balance = 1000;
    }

    console.log('[Forex Factory] Normalized account data:', accountData);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Error normalizing account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Calculate profit percentage from Forex Factory data
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
 * @param apiKey - Forex Factory API key
 * @param systemId - Trading system ID to sync
 * @param expectedStartBalance - Expected starting balance for validation
 * @returns SyncResult with balance and profit data
 */
export async function syncForexFactoryAccount(
  accountUsername: string,
  apiKey: string,
  systemId: string,
  expectedStartBalance: number = 1000
): Promise<SyncResult> {
  const accountData = await fetchForexFactoryAccountData(accountUsername, apiKey, systemId);

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
 * Test Forex Factory connection
 * Verifies that the API key and credentials are valid
 * @param accountUsername - Forex Factory account username
 * @param apiKey - Forex Factory API key
 * @param systemId - Trading system ID to verify
 * @returns { success: boolean; message?: string }
 */
export async function testForexFactoryConnection(
  accountUsername: string,
  apiKey: string,
  systemId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`[Forex Factory] Testing connection for account: ${accountUsername}`);
    console.log(`[Forex Factory] Using system ID: ${systemId}`);

    const accountData = await fetchForexFactoryAccountData(accountUsername, apiKey, systemId);

    if (!accountData) {
      console.error('[Forex Factory] Connection test failed: invalid account data');
      return {
        success: false,
        message: 'Could not fetch account data. Possible causes:\n1. Invalid Forex Factory account username\n2. API key is expired or invalid\n3. System ID does not exist\n4. Forex Factory service is unavailable'
      };
    }

    console.log(`[Forex Factory] Connection test successful for account: ${accountUsername}`);
    console.log(`[Forex Factory] Account data: Balance=${accountData.balance}, Equity=${accountData.equity}, Trades=${accountData.trades}`);
    return {
      success: true,
      message: `Successfully connected! Account ${accountUsername} has balance: ${accountData.balance} ${accountData.currency}`
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Forex Factory] Connection test failed: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }
}
