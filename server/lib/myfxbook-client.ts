/**
 * MyFXBook API Client
 * Handles communication with MyFXBook API to fetch account data
 * 
 * API Documentation: https://www.myfxbook.com/api/
 */

interface MyFXBookAccountData {
  id: string;
  name: string;
  currency: string;
  currentBalance: number;
  startBalance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
  marginLevel: number;
  grossProfit: number;
  grossLoss: number;
  tradingRecords: number;
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

const MYFXBOOK_API_BASE = 'https://www.myfxbook.com/api';

/**
 * Fetch account data from MyFXBook API
 * @param accountId - MyFXBook account ID
 * @param password - MyFXBook API password
 * @returns Account data or null if error
 */
export async function fetchMyFXBookAccountData(
  accountId: string,
  password: string
): Promise<MyFXBookAccountData | null> {
  try {
    console.log(`[MyFXBook] Fetching data for account: ${accountId}`);

    // MyFXBook API endpoint: GET /user/detail.json
    const url = new URL(`${MYFXBOOK_API_BASE}/user/detail.json`);
    url.searchParams.append('user', accountId);
    url.searchParams.append('password', password);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[MyFXBook] HTTP Error: ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Check if API returned an error
    if (!data.success) {
      console.error(`[MyFXBook] API Error: ${data.error || 'Unknown error'}`);
      throw new Error(data.error || 'API returned error');
    }

    if (!data.account) {
      console.error('[MyFXBook] No account data in response');
      throw new Error('No account data in response');
    }

    console.log(`[MyFXBook] Successfully fetched data for account: ${accountId}`);
    return data.account;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MyFXBook] Error fetching account data: ${errorMsg}`);
    return null;
  }
}

/**
 * Calculate profit percentage from MyFXBook data
 * @param currentBalance - Current account balance
 * @param startBalance - Starting balance
 * @returns Profit percentage
 */
export function calculateProfitPercentage(
  currentBalance: number,
  startBalance: number
): number {
  if (startBalance === 0) return 0;
  return ((currentBalance - startBalance) / startBalance) * 100;
}

/**
 * Sync account data from MyFXBook and return formatted result
 * @param accountId - MyFXBook account ID
 * @param password - MyFXBook API password
 * @param expectedStartBalance - Expected starting balance for validation
 * @returns SyncResult with balance and profit data
 */
export async function syncMyFXBookAccount(
  accountId: string,
  password: string,
  expectedStartBalance: number = 1000
): Promise<SyncResult> {
  const accountData = await fetchMyFXBookAccountData(accountId, password);

  if (!accountData) {
    return {
      success: false,
      accountId,
      currentBalance: 0,
      profitAmount: 0,
      profitPercentage: 0,
      currency: 'USD',
      error: 'Failed to fetch account data from MyFXBook',
    };
  }

  const currentBalance = accountData.currentBalance || 0;
  const profitAmount = currentBalance - expectedStartBalance;
  const profitPercentage = calculateProfitPercentage(currentBalance, expectedStartBalance);

  return {
    success: true,
    accountId,
    currentBalance,
    profitAmount,
    profitPercentage,
    currency: accountData.currency || 'USD',
  };
}

/**
 * Fetch account equity over time (optional, for advanced tracking)
 * @param accountId - MyFXBook account ID
 * @param password - MyFXBook API password
 * @returns Account history or null if error
 */
export async function fetchMyFXBookAccountHistory(
  accountId: string,
  password: string
): Promise<any | null> {
  try {
    console.log(`[MyFXBook] Fetching history for account: ${accountId}`);

    const url = new URL(`${MYFXBOOK_API_BASE}/user/equity.json`);
    url.searchParams.append('user', accountId);
    url.searchParams.append('password', password);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    console.log(`[MyFXBook] Successfully fetched history for account: ${accountId}`);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MyFXBook] Error fetching history: ${errorMsg}`);
    return null;
  }
}
