/**
 * MT5 REST API Client
 * Handles communication with MT5 trading platforms via REST API
 * 
 * Supports various MT5 REST API implementations:
 * - MetaApi (metaapi.cloud)
 * - Broker REST APIs
 * - Custom MT5 WebSocket/REST bridges
 */

export interface MT5AccountData {
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
 * Fetch account data from MT5 REST API
 * Supports multiple connection methods:
 * 1. MetaApi (metaapi.cloud) - token-based
 * 2. Custom broker REST API - various formats
 * 3. WebSocket bridge endpoint
 *
 * @param accountId - MT5 Account ID
 * @param apiToken - API token or password depending on provider
 * @param serverEndpoint - REST API endpoint URL (e.g., https://api.metaapi.cloud/v1/accounts)
 * @returns Account data or null if error
 */
export async function fetchMT5AccountData(
  accountId: string,
  apiToken: string,
  serverEndpoint: string
): Promise<MT5AccountData | null> {
  try {
    console.log(`[MT5] ============ MT5 FETCH STARTING ============`);
    console.log(`[MT5] Account ID: ${accountId}`);
    console.log(`[MT5] Endpoint: ${serverEndpoint}`);
    console.log(`[MT5] Token length: ${apiToken.length}`);
    console.log(`[MT5] Token first 50 chars: ${apiToken.substring(0, 50)}...`);

    // Validate endpoint is not a configuration page
    if (serverEndpoint.includes('/configure-trading-account-credentials/')) {
      const errorMsg = 'Invalid endpoint: You are using a MetaApi configuration page URL instead of the API endpoint. Use https://api.metaapi.cloud/v1/accounts instead.';
      console.error(`[MT5] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Normalize endpoint URL
    let url = serverEndpoint.trim();

    // Build the full account URL
    // If endpoint already contains {accountId} placeholder, replace it
    // Otherwise append the accountId to the end
    let accountDataUrl: string;

    if (url.includes('{accountId}')) {
      accountDataUrl = url.replace('{accountId}', accountId);
    } else if (url.endsWith('/')) {
      accountDataUrl = `${url}${accountId}`;
    } else {
      accountDataUrl = `${url}/${accountId}`;
    }

    console.log(`[MT5] Full request URL: ${accountDataUrl}`);

    let response;
    try {
      // Log request details for debugging
      console.log(`[MT5] Making request to: ${accountDataUrl}`);
      console.log(`[MT5] Token provided: ${apiToken ? 'Yes (length: ' + apiToken.length + ')' : 'No'}`);
      console.log(`[MT5] Authorization header: Bearer ${apiToken.substring(0, 50)}...`);

      response = await fetch(accountDataUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[MT5] Response status: ${response.status}`);
      console.log(`[MT5] Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
      console.error(`[MT5] Network error fetching from ${accountDataUrl}: ${errorMsg}`);
      console.error(`[MT5] This usually means:`);
      console.error(`[MT5]   1. The endpoint URL format is wrong`);
      console.error(`[MT5]   2. The MetaApi Account ID is incorrect`);
      console.error(`[MT5]   3. The API token is missing or invalid`);
      console.error(`[MT5]   4. MetaApi server is unreachable or blocking requests`);
      throw new Error(`Network error: ${errorMsg}`);
    }

    if (!response.ok) {
      const responseText = await response.text();

      // Check if response is HTML (likely a 404 or error page)
      if (responseText.trim().startsWith('<')) {
        const htmlPreview = responseText.substring(0, 200).replace(/\n/g, ' ');
        console.error(`[MT5] HTTP ${response.status}: Received HTML instead of JSON: ${htmlPreview}`);
        throw new Error(`HTTP ${response.status} (likely wrong endpoint). Server returned HTML. Check if the endpoint URL is correct.`);
      }

      console.error(`[MT5] HTTP Error ${response.status}: ${responseText.substring(0, 200)}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const responseText = await response.text();

      // Check if response is HTML
      if (responseText.trim().startsWith('<')) {
        const htmlPreview = responseText.substring(0, 200).replace(/\n/g, ' ');
        console.error(`[MT5] Received HTML instead of JSON: ${htmlPreview}`);
        throw new Error(`Invalid JSON response: Server returned HTML. This usually means:\n1. Wrong endpoint URL\n2. Account ID not recognized\n3. API credentials expired\n\nReceived: ${responseText.substring(0, 100)}`);
      }

      console.error(`[MT5] Failed to parse JSON response: ${responseText.substring(0, 200)}`);
      throw new Error(`Invalid JSON response from MT5 API. Server returned: ${responseText.substring(0, 100)}`);
    }

    // Normalize response data (different providers have different formats)
    const accountData = normalizeAccountData(data);

    if (!accountData) {
      console.error('[MT5] Failed to normalize account data');
      throw new Error('Invalid account data format');
    }

    console.log(`[MT5] Successfully fetched data for account: ${accountId}`);
    return accountData;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT5] Error fetching account data: ${errorMsg}`);
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
function normalizeAccountData(data: any): MT5AccountData | null {
  try {
    // Check if data is wrapped in 'account' property (MetaApi style)
    const account = data.account || data;

    // Extract fields with fallbacks
    const accountData: MT5AccountData = {
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
    console.error(`[MT5] Error normalizing account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Calculate profit percentage from MT5 data
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
 * Sync account data from MT5 and return formatted result
 * @param accountId - MT5 Account ID
 * @param apiToken - API token/password
 * @param serverEndpoint - API endpoint URL
 * @param expectedStartBalance - Expected starting balance for validation
 * @returns SyncResult with balance and profit data
 */
export async function syncMT5Account(
  accountId: string,
  apiToken: string,
  serverEndpoint: string,
  expectedStartBalance: number = 1000
): Promise<SyncResult> {
  const accountData = await fetchMT5AccountData(accountId, apiToken, serverEndpoint);

  if (!accountData) {
    return {
      success: false,
      accountId,
      currentBalance: 0,
      profitAmount: 0,
      profitPercentage: 0,
      currency: 'USD',
      error: 'Failed to fetch account data from MT5',
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
    currency: 'USD', // MT5 default, could be extended to detect actual currency
  };
}

/**
 * Test MT5 connection
 * Verifies that the API endpoint and credentials are valid
 * @param accountId - MT5 Account ID
 * @param apiToken - API token/password
 * @param serverEndpoint - API endpoint URL
 * @returns { success: boolean; message?: string }
 */
export async function testMT5Connection(
  accountId: string,
  apiToken: string,
  serverEndpoint: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`[MT5] Testing connection for account: ${accountId}`);
    console.log(`[MT5] Using endpoint: ${serverEndpoint}`);

    // Validate endpoint is not a configuration page
    if (serverEndpoint.includes('/configure-trading-account-credentials/')) {
      const message = 'Invalid endpoint: You are using a MetaApi configuration page URL instead of the API endpoint. Use https://api.metaapi.cloud/v1/accounts instead.';
      console.error(`[MT5] ${message}`);
      return { success: false, message };
    }

    const accountData = await fetchMT5AccountData(accountId, apiToken, serverEndpoint);

    if (!accountData) {
      console.error('[MT5] Connection test failed: invalid account data or unable to fetch');
      return {
        success: false,
        message: 'Could not fetch account data. Possible causes:\n1. Invalid Account ID for your MetaApi account\n2. API Token is expired or invalid\n3. MetaApi API is temporarily unavailable'
      };
    }

    console.log(`[MT5] Connection test successful for account: ${accountId}`);
    console.log(`[MT5] Account data received: Balance=${accountData.balance}, Equity=${accountData.equity}`);
    return {
      success: true,
      message: `Successfully connected! Account ${accountId} has balance: ${accountData.balance}`
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT5] Connection test failed: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }
}
