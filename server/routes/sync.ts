/**
 * MyFXBook & MT5 Sync Route Handler
 * API endpoint to manually trigger MyFXBook and MT5 data syncs
 *
 * Endpoints:
 * - POST /api/sync/trigger - Trigger sync for all MyFXBook integrations
 * - POST /api/sync/trigger/:integrationId - Trigger sync for specific MyFXBook integration
 * - POST /api/sync/mt5/trigger - Trigger MT5 sync for all integrations
 * - POST /api/sync/mt5/trigger/:integrationId - Trigger MT5 sync for specific integration
 * - GET /api/sync/status - Get sync status
 */

import { RequestHandler } from 'express';
import { syncMyFXBookAccount } from '../lib/myfxbook-client';
import { syncMT5Account } from '../lib/mt5-client';
import {
  getActiveIntegrations,
  getActiveMT5Integrations,
  getTraderByCredentialId,
  updatePerformanceData,
  logSyncAttempt,
  updateIntegrationSyncStatus,
  updateMT5IntegrationSyncStatus,
  getTraderStartingBalance,
} from '../lib/supabase-client';

interface SyncResponse {
  success: boolean;
  message: string;
  synced?: number;
  failed?: number;
  errors?: string[];
}

/**
 * Sync all active MyFXBook integrations
 */
export const handleSyncAll: RequestHandler = async (req, res) => {
  try {
    console.log('[Sync] Starting full sync of all integrations...');

    const integrations = await getActiveIntegrations();

    if (integrations.length === 0) {
      console.log('[Sync] No active integrations found');
      return res.json({
        success: true,
        message: 'No active integrations to sync',
        synced: 0,
      } as SyncResponse);
    }

    console.log(`[Sync] Found ${integrations.length} active integration(s)`);

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each integration
    for (const integration of integrations) {
      try {
        const result = await syncIntegration(integration);

        if (result) {
          syncedCount++;
        } else {
          failedCount++;
          errors.push(`Failed to sync integration: ${integration.id}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Integration ${integration.id}: ${errorMsg}`);
        console.error(`[Sync] Error syncing integration ${integration.id}:`, error);
      }
    }

    console.log(
      `[Sync] Sync complete. Synced: ${syncedCount}, Failed: ${failedCount}`
    );

    res.json({
      success: true,
      message: `Sync complete: ${syncedCount} success, ${failedCount} failed`,
      synced: syncedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sync] Error in handleSyncAll:', error);

    res.status(500).json({
      success: false,
      message: `Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Sync a specific integration
 */
export const handleSyncIntegration: RequestHandler = async (req, res) => {
  try {
    const { integrationId } = req.params;

    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'integrationId parameter required',
      } as SyncResponse);
    }

    console.log(`[Sync] Starting sync for integration: ${integrationId}`);

    const integrations = await getActiveIntegrations();
    const integration = integrations.find((i) => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
      } as SyncResponse);
    }

    const result = await syncIntegration(integration);

    res.json({
      success: result,
      message: result ? 'Sync successful' : 'Sync failed',
      synced: result ? 1 : 0,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sync] Error in handleSyncIntegration:', error);

    res.status(500).json({
      success: false,
      message: `Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Get sync status
 */
export const handleSyncStatus: RequestHandler = async (req, res) => {
  try {
    const integrations = await getActiveIntegrations();

    const status = integrations.map((i) => ({
      id: i.id,
      myfxbook_account_id: i.myfxbook_account_id,
      sync_status: i.sync_status,
      last_sync: i.last_sync,
    }));

    res.json({
      success: true,
      integrations: status,
      total: status.length,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sync] Error in handleSyncStatus:', error);

    res.status(500).json({
      success: false,
      message: `Failed to get status: ${errorMsg}`,
    });
  }
};

/**
 * Internal function to sync a single integration
 */
async function syncIntegration(integration: any): Promise<boolean> {
  try {
    const integrationId = integration.id;
    const credentialId = integration.credential_id;
    const myfxbookAccountId = integration.myfxbook_account_id;
    const myfxbookPassword = integration.myfxbook_password;

    console.log(`[Sync] Syncing integration ${integrationId}...`);

    // Step 1: Log sync start
    await logSyncAttempt(integrationId, 'automatic', 'in_progress');

    // Step 2: Get trader info
    const traderData = await getTraderByCredentialId(credentialId);

    if (!traderData || !traderData.traders) {
      const errorMsg = 'No trader associated with this credential';
      console.error(`[Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateIntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    const traderId = traderData.traders.id;
    const traderName = traderData.traders.full_name;

    console.log(`[Sync] Syncing for trader: ${traderName} (${traderId})`);

    // Step 3: Fetch account data from MyFXBook
    const syncResult = await syncMyFXBookAccount(
      myfxbookAccountId,
      myfxbookPassword
    );

    if (!syncResult.success) {
      const errorMsg = syncResult.error || 'Unknown error fetching MyFXBook data';
      console.error(`[Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateIntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    console.log(
      `[Sync] MyFXBook data: Balance=${syncResult.currentBalance}, Profit=${syncResult.profitPercentage}%`
    );

    // Step 4: Update performance data
    const updateSuccess = await updatePerformanceData(
      traderId,
      syncResult.currentBalance,
      syncResult.profitPercentage
    );

    if (!updateSuccess) {
      const errorMsg = 'Failed to update performance data';
      console.error(`[Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateIntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    // Step 5: Log successful sync
    await logSyncAttempt(integrationId, 'automatic', 'success', 1);
    await updateIntegrationSyncStatus(integrationId, 'success');

    console.log(`[Sync] Successfully synced integration ${integrationId}`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Sync] Error in syncIntegration:`, error);
    await logSyncAttempt(integration.id, 'automatic', 'error', 0, errorMsg);
    await updateIntegrationSyncStatus(integration.id, 'error', errorMsg);
    return false;
  }
}

/**
 * Sync all active MT5 integrations
 */
export const handleMT5SyncAll: RequestHandler = async (req, res) => {
  try {
    console.log('[MT5 Sync] Starting full sync of all MT5 integrations...');

    const integrations = await getActiveMT5Integrations();

    if (integrations.length === 0) {
      console.log('[MT5 Sync] No active MT5 integrations found');
      return res.json({
        success: true,
        message: 'No active MT5 integrations to sync',
        synced: 0,
      } as SyncResponse);
    }

    console.log(`[MT5 Sync] Found ${integrations.length} active MT5 integration(s)`);

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each integration
    for (const integration of integrations) {
      try {
        const result = await syncMT5Integration(integration);

        if (result.success) {
          syncedCount++;
        } else {
          failedCount++;
          errors.push(`MT5 Integration ${integration.id}: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`MT5 Integration ${integration.id}: ${errorMsg}`);
        console.error(`[MT5 Sync] Error syncing integration ${integration.id}:`, error);
      }
    }

    console.log(
      `[MT5 Sync] Sync complete. Synced: ${syncedCount}, Failed: ${failedCount}`
    );

    res.json({
      success: true,
      message: `MT5 Sync complete: ${syncedCount} success, ${failedCount} failed`,
      synced: syncedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT5 Sync] Error in handleMT5SyncAll:', error);

    res.status(500).json({
      success: false,
      message: `MT5 Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Sync a specific MT5 integration
 */
export const handleMT5SyncIntegration: RequestHandler = async (req, res) => {
  try {
    const { integrationId } = req.params;

    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'integrationId parameter required',
      } as SyncResponse);
    }

    console.log(`[MT5 Sync] Starting sync for MT5 integration: ${integrationId}`);

    const integrations = await getActiveMT5Integrations();
    console.log(`[MT5 Sync] Found ${integrations.length} active integration(s)`);
    console.log(`[MT5 Sync] Integration IDs: ${integrations.map((i) => i.id).join(', ')}`);

    const integration = integrations.find((i) => i.id === integrationId);

    if (!integration) {
      console.error(`[MT5 Sync] Integration ${integrationId} not found in active integrations`);
      return res.status(404).json({
        success: false,
        message: 'MT5 Integration not found',
      } as SyncResponse);
    }

    const result = await syncMT5Integration(integration);

    res.json({
      success: result.success,
      message: result.success ? 'MT5 Sync successful' : `MT5 Sync failed: ${result.error}`,
      synced: result.success ? 1 : 0,
      error: result.error,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT5 Sync] Error in handleMT5SyncIntegration:', error);

    res.status(500).json({
      success: false,
      message: `MT5 Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Test MT5 connection with provided credentials
 */
export const handleMT5TestConnection: RequestHandler = async (req, res) => {
  try {
    const { mt5_account_id, mt5_api_token, mt5_server_endpoint } = req.body;

    if (!mt5_account_id || !mt5_api_token || !mt5_server_endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: mt5_account_id, mt5_api_token, mt5_server_endpoint',
      });
    }

    console.log('[MT5 Test] Testing connection with provided credentials...');
    console.log('[MT5 Test] Account ID:', mt5_account_id);
    console.log('[MT5 Test] Endpoint:', mt5_server_endpoint);
    console.log('[MT5 Test] Token length:', mt5_api_token.length);

    const { testMT5Connection } = await import('../lib/mt5-client');
    const testResult = await testMT5Connection(
      mt5_account_id,
      mt5_api_token,
      mt5_server_endpoint
    );

    if (testResult.success) {
      console.log('[MT5 Test] Connection successful!');
      return res.json({
        success: true,
        message: testResult.message || 'MT5 connection test successful! Your configuration is correct.',
      });
    } else {
      console.log('[MT5 Test] Connection failed');
      return res.json({
        success: false,
        message: testResult.message || 'MT5 connection test failed. Check your credentials and endpoint URL.',
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT5 Test] Error:', error);

    res.status(500).json({
      success: false,
      message: `MT5 connection test error: ${errorMsg}`,
    });
  }
};

/**
 * Internal function to sync a single MT5 integration
 */
async function syncMT5Integration(integration: any): Promise<{ success: boolean; error?: string }> {
  try {
    const integrationId = integration.id;
    const credentialId = integration.credential_id;
    const mt5AccountId = integration.mt5_account_id;
    const mt5ApiToken = integration.mt5_api_token;
    const mt5ServerEndpoint = integration.mt5_server_endpoint;

    console.log(`[MT5 Sync] Syncing integration ${integrationId}...`);

    // Validate required fields
    if (!mt5AccountId || !mt5ApiToken || !mt5ServerEndpoint) {
      const missing = [
        !mt5AccountId ? 'MT5 Account ID' : null,
        !mt5ApiToken ? 'MT5 API Token' : null,
        !mt5ServerEndpoint ? 'MT5 Server Endpoint' : null,
      ].filter(Boolean).join(', ');

      const errorMsg = `Missing required MT5 configuration: ${missing}`;
      console.error(`[MT5 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT5IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Step 1: Log sync start
    await logSyncAttempt(integrationId, 'automatic', 'in_progress');

    // Step 2: Get trader info
    const traderData = await getTraderByCredentialId(credentialId);

    if (!traderData || !traderData.traders) {
      const errorMsg = 'No trader associated with this credential';
      console.error(`[MT5 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT5IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return { success: false, error: errorMsg };
    }

    const traderId = traderData.traders.id;
    const traderName = traderData.traders.full_name;

    console.log(`[MT5 Sync] Syncing for trader: ${traderName} (${traderId})`);
    console.log(`[MT5 Sync] Using MT5 Account: ${mt5AccountId}, Endpoint: ${mt5ServerEndpoint}`);

    // Step 3: Fetch account data from MT5
    const syncResult = await syncMT5Account(
      mt5AccountId,
      mt5ApiToken,
      mt5ServerEndpoint,
      1000
    );

    if (!syncResult.success) {
      const errorMsg = syncResult.error || 'Unknown error fetching MT5 data';
      console.error(`[MT5 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT5IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(
      `[MT5 Sync] MT5 data: Balance=${syncResult.currentBalance}, Profit=${syncResult.profitPercentage}%`
    );

    // Step 4: Update performance data
    const updateSuccess = await updatePerformanceData(
      traderId,
      syncResult.currentBalance,
      syncResult.profitPercentage
    );

    if (!updateSuccess) {
      const errorMsg = 'Failed to update performance data';
      console.error(`[MT5 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT5IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Step 5: Log successful sync
    await logSyncAttempt(integrationId, 'automatic', 'success', 1);
    await updateMT5IntegrationSyncStatus(integrationId, 'success');

    console.log(`[MT5 Sync] Successfully synced integration ${integrationId}`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT5 Sync] Error in syncMT5Integration:`, error);
    await logSyncAttempt(integration.id, 'automatic', 'error', 0, errorMsg);
    await updateMT5IntegrationSyncStatus(integration.id, 'error', errorMsg);
    return { success: false, error: errorMsg };
  }
}
