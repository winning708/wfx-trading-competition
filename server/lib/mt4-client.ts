/**
 * MT4/MT5 REST API Client
 * Handles communication with MT4/MT5 trading platforms via REST API
 * 
 * Supports various MT4/MT5 REST API implementations:
 * - MetaApi (metaapi.cloud)
 * - Broker REST APIs
 * - Custom MT4 WebSocket/REST bridges
 */

export interface MT4AccountData {
  accountId: string;
  balance: number;
  equity: number;
  credit: number;
  profit: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  trades: number;
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
 * Fetch account data from MT4/MT5 REST API
 * Supports multiple connection methods:
 * 1. MetaApi (metaapi.cloud) - token-based
 * 2. Custom broker REST API - various formats
 * 3. WebSocket bridge endpoint
 * 
 * @param accountId - MT4 Account ID
 * @param apiToken - API token or password depending on provider
 * @param serverEndpoint - REST API endpoint URL (e.g., https://mt4.broker.com/api)
 * @param platform - 'mt4' or 'mt5'
 * @returns Account data or null if error
 */
export async function fetchMT4AccountData(
  accountId: string,
  apiToken: string,
  serverEndpoint: string,
  platform: 'mt4' | 'mt5' = 'mt4'
): Promise<MT4AccountData | null> {
  try {
    console.log(`[MT4] Fetching data for account: ${accountId} (${platform.toUpperCase()})`);

    // Normalize endpoint URL
    let url = serverEndpoint.trim();
    if (!url.endsWith('/')) {
      url += '/';
    }

    // Different API endpoint formats based on platform/provider
    const accountDataUrl = `${url}accounts/${accountId}`;

    const response = await fetch(accountDataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[MT4] HTTP Error: ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Normalize response data (different providers have different formats)
    const accountData = normalizeAccountData(data);

    if (!accountData) {
      console.error('[MT4] Failed to normalize account data');
      throw new Error('Invalid account data format');
    }

    console.log(`[MT4] Successfully fetched data for account: ${accountId}`);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT4] Error fetching account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Normalize account data from different API providers
 * Handles various response formats:
 * - MetaApi format: { account: { balance, equity, ... } }
 * - Generic REST format: { balance, equity, ... }
 * - Broker custom format
 */
function normalizeAccountData(data: any): MT4AccountData | null {
  try {
    // Check if data is wrapped in 'account' property (MetaApi style)
    const account = data.account || data;

    // Extract fields with fallbacks
    const accountData: MT4AccountData = {
      accountId: account.accountId || account.id || account.account_id || '',
      balance: parseFloat(account.balance) || 0,
      equity: parseFloat(account.equity) || 0,
      credit: parseFloat(account.credit) || 0,
      profit: parseFloat(account.profit) || 0,
      margin: parseFloat(account.margin) || 0,
      freeMargin: parseFloat(account.freeMargin || account.free_margin) || 0,
      marginLevel: parseFloat(account.marginLevel || account.margin_level) || 0,
      trades: parseInt(account.trades) || 0,
    };

    // Validate required fields
    if (!accountData.balance || accountData.balance === 0) {
      throw new Error('Invalid balance in account data');
    }

    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT4] Error normalizing account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Calculate profit percentage from MT4 data
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
 * Sync account data from MT4/MT5 and return formatted result
 * @param accountId - MT4 Account ID
 * @param apiToken - API token/password
 * @param serverEndpoint - API endpoint URL
 * @param expectedStartBalance - Expected starting balance for validation
 * @param platform - 'mt4' or 'mt5'
 * @returns SyncResult with balance and profit data
 */
export async function syncMT4Account(
  accountId: string,
  apiToken: string,
  serverEndpoint: string,
  expectedStartBalance: number = 1000,
  platform: 'mt4' | 'mt5' = 'mt4'
): Promise<SyncResult> {
  const accountData = await fetchMT4AccountData(accountId, apiToken, serverEndpoint, platform);

  if (!accountData) {
    return {
      success: false,
      accountId,
      currentBalance: 0,
      profitAmount: 0,
      profitPercentage: 0,
      currency: 'USD',
      error: `Failed to fetch account data from ${platform.toUpperCase()}`,
    };
  }

  const currentBalance = accountData.balance;
  const profitAmount = currentBalance - expectedStartBalance;
  const profitPercentage = calculateProfitPercentage(currentBalance, expectedStartBalance);

  return {
    success: true,
    accountId,
    currentBalance,
    profitAmount,
    profitPercentage,
    currency: 'USD', // MT4 default, could be extended to detect actual currency
  };
}

/**
 * Test MT4 connection
 * Verifies that the API endpoint and credentials are valid
 * @param accountId - MT4 Account ID
 * @param apiToken - API token/password
 * @param serverEndpoint - API endpoint URL
 * @param platform - 'mt4' or 'mt5'
 * @returns true if connection successful, false otherwise
 */
export async function testMT4Connection(
  accountId: string,
  apiToken: string,
  serverEndpoint: string,
  platform: 'mt4' | 'mt5' = 'mt4'
): Promise<boolean> {
  try {
    console.log(`[MT4] Testing connection for account: ${accountId}`);

    const accountData = await fetchMT4AccountData(accountId, apiToken, serverEndpoint, platform);

    if (!accountData) {
      console.error('[MT4] Connection test failed: invalid account data');
      return false;
    }

    console.log(`[MT4] Connection test successful for account: ${accountId}`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT4] Connection test failed: ${errorMsg}`);
    return false;
  }
}
