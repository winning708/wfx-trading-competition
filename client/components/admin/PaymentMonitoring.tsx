import { useState, useEffect } from "react";
import {
  getPaymentTransactions,
  getPaymentStats,
  getFailedPayments,
  getPaymentMethodStats,
  PaymentTransaction,
  PaymentStats,
} from "@/lib/payments";
import { AlertCircle, Check, Clock, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

interface MethodStat {
  method: string;
  count: number;
  total: number;
  success_rate: number;
}

export function PaymentMonitoring() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [failedPayments, setFailedPayments] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total_transactions: 0,
    total_revenue: 0,
    successful_payments: 0,
    failed_payments: 0,
    pending_payments: 0,
    success_rate: 0,
  });
  const [methodStats, setMethodStats] = useState<MethodStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "failed" | "pending">("all");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load stats
      const statsData = await getPaymentStats();
      setStats(statsData);

      // Load transactions with filter
      const transactionsData = await getPaymentTransactions({
        status: filter !== "all" ? filter : undefined,
        limit: 50,
      });
      setTransactions(transactionsData);

      // Load failed payments for alerts
      const failedData = await getFailedPayments(10);
      setFailedPayments(failedData);

      // Load method stats
      const methodData = await getPaymentMethodStats();
      setMethodStats(methodData);
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, refetchTrigger]);

  const handleRefresh = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "failed":
        return "bg-destructive/10 text-destructive";
      case "pending":
        return "bg-primary/10 text-primary";
      case "processing":
        return "bg-yellow-500/10 text-yellow-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "flutterwave":
        return "bg-blue-500/10 text-blue-600";
      case "binance":
        return "bg-yellow-500/10 text-yellow-600";
      case "bybit":
        return "bg-purple-500/10 text-purple-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {failedPayments.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                ⚠️ {failedPayments.length} Failed Payment{failedPayments.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                There {failedPayments.length === 1 ? "is" : "are"} payment{failedPayments.length !== 1 ? "s" : ""} that failed. Check the
                failed payments section below to take action.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-foreground">{stats.total_transactions}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">
                ${stats.total_revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Successful</p>
              <p className="text-3xl font-bold text-success">{stats.successful_payments}</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <Check className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Failed</p>
              <p className="text-3xl font-bold text-destructive">{stats.failed_payments}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-primary">
                {stats.success_rate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Overview */}
      {methodStats.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {methodStats.map((method) => (
              <div key={method.method} className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getMethodColor(method.method)}`}>
                    {method.method}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{method.success_rate.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">{method.count} transactions</p>
                  <p className="font-medium text-foreground">
                    ${method.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {["all", "completed", "pending", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-card/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Trader
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Method
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-muted-foreground">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {tx.trader?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {tx.trader?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${getMethodColor(tx.payment_method)}`}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      ${tx.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Payments Detail */}
      {failedPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Failed Payments</h3>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-destructive/20 bg-destructive/5">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-destructive">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-destructive">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-destructive">
                    Method
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-destructive">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-destructive">
                    Error
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-destructive">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {failedPayments.map((tx) => (
                  <tr key={tx.id} className="border-b border-destructive/20">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {tx.trader?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {tx.trader?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${getMethodColor(tx.payment_method)}`}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-destructive">
                      ${tx.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-destructive max-w-xs truncate">
                      {tx.error_message || "No error message"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
