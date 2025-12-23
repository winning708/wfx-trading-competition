/**
 * MyFXBook & MT4/MT5 Sync Route Handler
 * API endpoint to manually trigger MyFXBook and MT4/MT5 data syncs
 *
 * Endpoints:
 * - POST /api/sync/trigger - Trigger sync for all integrations
 * - POST /api/sync/trigger/:integrationId - Trigger sync for specific integration
 * - POST /api/sync/mt4/trigger - Trigger MT4/MT5 sync for all integrations
 * - POST /api/sync/mt4/trigger/:integrationId - Trigger MT4/MT5 sync for specific integration
 * - GET /api/sync/status - Get sync status
 */

import { RequestHandler } from 'express';
import { syncMyFXBookAccount } from '../lib/myfxbook-client';
import { syncMT4Account } from '../lib/mt4-client';
import {
  getActiveIntegrations,
  getActiveMT4Integrations,
  getTraderByCredentialId,
  updatePerformanceData,
  logSyncAttempt,
  updateIntegrationSyncStatus,
  updateMT4IntegrationSyncStatus,
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
 * Sync all active MT4/MT5 integrations
 */
export const handleMT4SyncAll: RequestHandler = async (req, res) => {
  try {
    console.log('[MT4 Sync] Starting full sync of all MT4/MT5 integrations...');

    const integrations = await getActiveMT4Integrations();

    if (integrations.length === 0) {
      console.log('[MT4 Sync] No active MT4 integrations found');
      return res.json({
        success: true,
        message: 'No active MT4 integrations to sync',
        synced: 0,
      } as SyncResponse);
    }

    console.log(`[MT4 Sync] Found ${integrations.length} active MT4 integration(s)`);

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each integration
    for (const integration of integrations) {
      try {
        const result = await syncMT4Integration(integration);

        if (result) {
          syncedCount++;
        } else {
          failedCount++;
          errors.push(`Failed to sync MT4 integration: ${integration.id}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`MT4 Integration ${integration.id}: ${errorMsg}`);
        console.error(`[MT4 Sync] Error syncing integration ${integration.id}:`, error);
      }
    }

    console.log(
      `[MT4 Sync] Sync complete. Synced: ${syncedCount}, Failed: ${failedCount}`
    );

    res.json({
      success: true,
      message: `MT4 Sync complete: ${syncedCount} success, ${failedCount} failed`,
      synced: syncedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT4 Sync] Error in handleMT4SyncAll:', error);

    res.status(500).json({
      success: false,
      message: `MT4 Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Sync a specific MT4/MT5 integration
 */
export const handleMT4SyncIntegration: RequestHandler = async (req, res) => {
  try {
    const { integrationId } = req.params;

    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'integrationId parameter required',
      } as SyncResponse);
    }

    console.log(`[MT4 Sync] Starting sync for MT4 integration: ${integrationId}`);

    const integrations = await getActiveMT4Integrations();
    const integration = integrations.find((i) => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'MT4 Integration not found',
      } as SyncResponse);
    }

    const result = await syncMT4Integration(integration);

    res.json({
      success: result,
      message: result ? 'MT4 Sync successful' : 'MT4 Sync failed',
      synced: result ? 1 : 0,
    } as SyncResponse);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MT4 Sync] Error in handleMT4SyncIntegration:', error);

    res.status(500).json({
      success: false,
      message: `MT4 Sync failed: ${errorMsg}`,
    } as SyncResponse);
  }
};

/**
 * Internal function to sync a single MT4/MT5 integration
 */
async function syncMT4Integration(integration: any): Promise<boolean> {
  try {
    const integrationId = integration.id;
    const credentialId = integration.credential_id;
    const mt4AccountId = integration.mt4_account_id;
    const mt4ApiToken = integration.mt4_api_token;
    const mt4ServerEndpoint = integration.mt4_server_endpoint;
    const mt4Platform = integration.mt4_platform || 'mt4';

    console.log(`[MT4 Sync] Syncing integration ${integrationId}...`);

    // Step 1: Log sync start
    await logSyncAttempt(integrationId, 'automatic', 'in_progress');

    // Step 2: Get trader info
    const traderData = await getTraderByCredentialId(credentialId);

    if (!traderData || !traderData.traders) {
      const errorMsg = 'No trader associated with this credential';
      console.error(`[MT4 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT4IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    const traderId = traderData.traders.id;
    const traderName = traderData.traders.full_name;

    console.log(`[MT4 Sync] Syncing for trader: ${traderName} (${traderId})`);

    // Step 3: Fetch account data from MT4/MT5
    const syncResult = await syncMT4Account(
      mt4AccountId,
      mt4ApiToken,
      mt4ServerEndpoint,
      1000,
      mt4Platform
    );

    if (!syncResult.success) {
      const errorMsg = syncResult.error || 'Unknown error fetching MT4 data';
      console.error(`[MT4 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT4IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    console.log(
      `[MT4 Sync] MT4 data: Balance=${syncResult.currentBalance}, Profit=${syncResult.profitPercentage}%`
    );

    // Step 4: Update performance data
    const updateSuccess = await updatePerformanceData(
      traderId,
      syncResult.currentBalance,
      syncResult.profitPercentage
    );

    if (!updateSuccess) {
      const errorMsg = 'Failed to update performance data';
      console.error(`[MT4 Sync] ${errorMsg}`);
      await logSyncAttempt(integrationId, 'automatic', 'error', 0, errorMsg);
      await updateMT4IntegrationSyncStatus(integrationId, 'error', errorMsg);
      return false;
    }

    // Step 5: Log successful sync
    await logSyncAttempt(integrationId, 'automatic', 'success', 1);
    await updateMT4IntegrationSyncStatus(integrationId, 'success');

    console.log(`[MT4 Sync] Successfully synced integration ${integrationId}`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MT4 Sync] Error in syncMT4Integration:`, error);
    await logSyncAttempt(integration.id, 'automatic', 'error', 0, errorMsg);
    await updateMT4IntegrationSyncStatus(integration.id, 'error', errorMsg);
    return false;
  }
}
