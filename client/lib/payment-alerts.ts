import { getFailedPayments, PaymentTransaction } from './payments';

export interface PaymentAlert {
  id: string;
  trader_id: string;
  trader_email: string;
  trader_name: string;
  payment_method: string;
  amount: number;
  error_message: string;
  failed_at: string;
  alert_sent_at?: string;
  alert_read: boolean;
}

// Store alerts in localStorage for the session
const ALERTS_KEY = 'payment_alerts';
const LAST_CHECK_KEY = 'last_payment_check';

export function storeAlert(alert: PaymentAlert): void {
  try {
    const alerts = getStoredAlerts();
    const exists = alerts.some((a) => a.id === alert.id);
    if (!exists) {
      alerts.push(alert);
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error('Error storing alert:', error);
  }
}

export function getStoredAlerts(): PaymentAlert[] {
  try {
    const stored = localStorage.getItem(ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving alerts:', error);
    return [];
  }
}

export function getUnreadAlerts(): PaymentAlert[] {
  return getStoredAlerts().filter((alert) => !alert.alert_read);
}

export function markAlertAsRead(alertId: string): void {
  try {
    const alerts = getStoredAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.alert_read = true;
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
}

export function clearAlert(alertId: string): void {
  try {
    const alerts = getStoredAlerts().filter((a) => a.id !== alertId);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error clearing alert:', error);
  }
}

export function clearAllAlerts(): void {
  try {
    localStorage.removeItem(ALERTS_KEY);
  } catch (error) {
    console.error('Error clearing all alerts:', error);
  }
}

/**
 * Check for new failed payments and create alerts
 * This should be called periodically (e.g., every 5 minutes in the admin dashboard)
 */
export async function checkForFailedPayments(): Promise<PaymentAlert[]> {
  try {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const lastCheckTime = lastCheck ? new Date(lastCheck).getTime() : 0;
    const now = Date.now();

    // Only check if at least 1 minute has passed since last check
    if (now - lastCheckTime < 60000) {
      return [];
    }

    // Update last check time
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

    // Get failed payments
    const failedPayments = await getFailedPayments(20);
    const newAlerts: PaymentAlert[] = [];

    // Get existing alert IDs to avoid duplicates
    const existingAlerts = getStoredAlerts();
    const existingIds = new Set(existingAlerts.map((a) => a.id));

    // Create alerts for new failed payments
    failedPayments.forEach((payment) => {
      const alertId = `failed_${payment.id}`;
      if (!existingIds.has(alertId)) {
        const alert: PaymentAlert = {
          id: alertId,
          trader_id: payment.trader_id,
          trader_email: payment.trader?.email || 'Unknown',
          trader_name: payment.trader?.full_name || 'Unknown',
          payment_method: payment.payment_method,
          amount: payment.amount,
          error_message: payment.error_message || 'Unknown error',
          failed_at: payment.attempted_at,
          alert_read: false,
        };
        newAlerts.push(alert);
        storeAlert(alert);
      }
    });

    return newAlerts;
  } catch (error) {
    console.error('Error checking for failed payments:', error);
    return [];
  }
}

/**
 * Format alert for display
 */
export function formatAlertMessage(alert: PaymentAlert): string {
  return `Payment from ${alert.trader_name} (${alert.trader_email}) via ${alert.payment_method} for $${alert.amount.toFixed(
    2
  )} failed: ${alert.error_message}`;
}

/**
 * Get alert severity based on payment method and amount
 */
export function getAlertSeverity(
  alert: PaymentAlert
): 'low' | 'medium' | 'high' {
  if (alert.amount > 500) return 'high';
  if (alert.amount > 100) return 'medium';
  return 'low';
}

/**
 * Suggest retry action for failed payment
 */
export function getSuggestedAction(alert: PaymentAlert): string {
  const errorLower = alert.error_message.toLowerCase();

  if (errorLower.includes('signature')) {
    return 'Verify webhook signature configuration in payment processor settings';
  }
  if (errorLower.includes('trader')) {
    return 'Verify trader account exists and is properly registered';
  }
  if (errorLower.includes('network')) {
    return 'Check internet connection and retry payment';
  }
  if (errorLower.includes('amount')) {
    return 'Verify payment amount and currency settings';
  }

  return 'Review error message and contact payment processor support';
}
