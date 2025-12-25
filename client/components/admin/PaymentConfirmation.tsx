import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PendingPayment {
  ref: string;
  method: "binance" | "bybit";
  email: string;
  amount: number;
  createdAt: string;
}

export function PaymentConfirmation() {
  const [method, setMethod] = useState<"binance" | "bybit">("binance");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !amount || (method === "bybit" && !txHash)) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // Create reference
      const ref = `${method}_${email}_${Date.now()}`;

      // Call the backend confirmation endpoint
      const response = await fetch("/api/payment/confirm-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref,
          method,
          email,
          txHash: txHash || undefined,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm payment");
      }

      setSuccess(`✅ Payment confirmed for ${email}! User will see credentials on their dashboard.`);
      
      // Reset form
      setEmail("");
      setAmount("");
      setTxHash("");

      // Reload pending payments after a short delay
      setTimeout(() => loadPendingPayments(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      // Fetch pending manual payments from the database
      const { data, error: err } = await supabase
        .from("payment_transactions")
        .select("*")
        .in("payment_method", ["binance", "bybit"])
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (err) throw err;

      if (data) {
        setPendingPayments(
          data.map((tx: any) => ({
            ref: tx.transaction_id,
            method: tx.payment_method,
            email: tx.trader_email,
            amount: tx.amount,
            createdAt: tx.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading pending payments:", err);
    }
  };

  const handleConfirmPending = async (payment: PendingPayment) => {
    setEmail(payment.email);
    setAmount(payment.amount.toString());
    setMethod(payment.method);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          🔐 Manual Payment Confirmation
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Binance:</strong> When a user pays to your Binance Merchant ID, confirm the payment here after receiving it.
          </p>
          <p>
            <strong>Bybit (USDT):</strong> When a user sends USDT to your TRC-20 wallet, confirm the payment here with the transaction hash.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
            <p className="text-primary font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              A confirmation email is automatically sent to the user after you confirm their payment.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Confirm Payment</h3>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-success/50 bg-success/5 p-4 flex gap-3">
            <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        <form onSubmit={handleConfirmPayment} className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Method
            </label>
            <div className="flex gap-3">
              {(["binance", "bybit"] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={(e) => setMethod(e.target.value as "binance" | "bybit")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* User Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              User Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
              Amount ({method === "binance" ? "USD" : "USDT"})
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Bybit TX Hash */}
          {method === "bybit" && (
            <div>
              <label htmlFor="txHash" className="block text-sm font-medium text-foreground mb-2">
                Transaction Hash (TXID)
              </label>
              <Input
                id="txHash"
                type="text"
                placeholder="0x... or transaction hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this on BlockScout for TRON transactions
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Confirming..." : "✓ Confirm Payment & Send Email"}
          </Button>
        </form>
      </div>

      {/* Quick Reference */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">How to Find Payment Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">📱 Binance</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>User pays to your Merchant ID</li>
              <li>You receive payment notification from Binance</li>
              <li>Confirm here with user email and amount</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">🔗 Bybit USDT (TRC-20)</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>User sends USDT to your wallet address</li>
              <li>Check your wallet on <a href="https://tronscan.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TronScan</a></li>
              <li>Copy the transaction hash/TXID</li>
              <li>Enter email, amount, and TXID above to confirm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
