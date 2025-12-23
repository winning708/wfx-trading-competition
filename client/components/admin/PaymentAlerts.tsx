import { useEffect, useState } from "react";
import {
  AlertCircle,
  X,
  Clock,
  TrendingDown,
  Bell,
} from "lucide-react";
import {
  checkForFailedPayments,
  getUnreadAlerts,
  markAlertAsRead,
  clearAlert,
  PaymentAlert,
  formatAlertMessage,
  getAlertSeverity,
  getSuggestedAction,
} from "@/lib/payment-alerts";

interface PaymentAlertsProps {
  onNewAlerts?: (count: number) => void;
}

export function PaymentAlerts({ onNewAlerts }: PaymentAlertsProps) {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [isCheckingPayments, setIsCheckingPayments] = useState(false);

  // Check for new failed payments periodically
  useEffect(() => {
    const checkPayments = async () => {
      setIsCheckingPayments(true);
      try {
        const newAlerts = await checkForFailedPayments();
        const unreadAlerts = getUnreadAlerts();
        setAlerts(unreadAlerts);
        if (onNewAlerts) {
          onNewAlerts(unreadAlerts.length);
        }
      } catch (error) {
        console.error("Error checking for failed payments:", error);
      } finally {
        setIsCheckingPayments(false);
      }
    };

    // Check immediately on mount
    checkPayments();

    // Check every 5 minutes
    const interval = setInterval(checkPayments, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [onNewAlerts]);

  const handleDismiss = (alertId: string) => {
    markAlertAsRead(alertId);
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const handleClear = (alertId: string) => {
    clearAlert(alertId);
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {alerts.map((alert) => {
        const severity = getAlertSeverity(alert);
        const isExpanded = expandedAlertId === alert.id;

        return (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 transition-all ${
              severity === "high"
                ? "border-destructive/50 bg-destructive/5"
                : severity === "medium"
                ? "border-yellow-500/50 bg-yellow-500/5"
                : "border-primary/50 bg-primary/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 flex-shrink-0 ${
                severity === "high"
                  ? "text-destructive"
                  : severity === "medium"
                  ? "text-yellow-600"
                  : "text-primary"
              }`}>
                <AlertCircle className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    severity === "high"
                      ? "text-destructive"
                      : severity === "medium"
                      ? "text-yellow-600"
                      : "text-primary"
                  }`}>
                    Payment Failed
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${
                      severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : severity === "medium"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {severity}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {alert.trader_name} ({alert.trader_email})
                </p>

                <p className="text-sm font-medium text-foreground mb-2">
                  ${alert.amount.toFixed(2)} via{" "}
                  <span className="capitalize text-primary">{alert.payment_method}</span>
                </p>

                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.failed_at).toLocaleString()}
                </div>

                {!isExpanded && (
                  <p className="text-xs text-destructive/80 mb-2 line-clamp-1">
                    {alert.error_message}
                  </p>
                )}

                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">
                        Error Details:
                      </p>
                      <p className="text-xs text-destructive/80 bg-destructive/5 p-2 rounded">
                        {alert.error_message}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">
                        Suggested Action:
                      </p>
                      <p className="text-xs text-muted-foreground bg-card p-2 rounded">
                        {getSuggestedAction(alert)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleClear(alert.id)}
                    className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleClear(alert.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Alert badge to show in header
 */
export function PaymentAlertBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      const unreadAlerts = getUnreadAlerts();
      setUnreadCount(unreadAlerts.length);
    };

    checkAlerts();

    // Check every minute
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-destructive" />
      <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
        {unreadCount}
      </span>
    </div>
  );
}
