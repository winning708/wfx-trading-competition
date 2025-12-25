import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Trader {
  id: string;
  full_name: string;
  email: string;
  payment_status?: string;
}

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date());

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const traderEmail = localStorage.getItem("trader_email");
        if (!traderEmail) {
          navigate("/");
          return;
        }

        const { data: traderData, error } = await supabase
          .from("traders")
          .select("id, full_name, email, payment_status")
          .eq("email", traderEmail)
          .single();

        if (error) {
          console.error("Error fetching trader:", error.message || error);
          setIsLoading(false);
          return;
        }

        if (!traderData) {
          console.error("Trader not found");
          setIsLoading(false);
          return;
        }

        setTrader(traderData);
        setLastCheckTime(new Date());

        if (traderData.payment_status === "approved") {
          setIsApproved(true);
          // Redirect to dashboard after 2 seconds
          const timer = setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
          return () => clearTimeout(timer);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error checking payment status:", errorMsg);
        setIsLoading(false);
      }
    };

    checkPaymentStatus();

    // Check payment status every 30 seconds
    const interval = setInterval(checkPaymentStatus, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleManualCheck = async () => {
    setIsLoading(true);
    const checkPaymentStatus = async () => {
      try {
        const traderEmail = localStorage.getItem("trader_email");
        if (!traderEmail) {
          navigate("/");
          return;
        }

        const { data: traderData, error } = await supabase
          .from("traders")
          .select("id, full_name, email, payment_status")
          .eq("email", traderEmail)
          .single();

        if (error) {
          console.error("Error fetching trader:", error.message || error);
          setIsLoading(false);
          return;
        }

        if (!traderData) {
          console.error("Trader not found");
          setIsLoading(false);
          return;
        }

        setTrader(traderData);
        setLastCheckTime(new Date());

        if (traderData.payment_status === "approved") {
          setIsApproved(true);
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error checking payment status:", errorMsg);
        setIsLoading(false);
      }
    };
    
    await checkPaymentStatus();
  };

  if (isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Payment Approved! 🎉
            </h2>
            <p className="text-muted-foreground mb-4">
              Your payment has been verified. Redirecting to your dashboard...
            </p>
            <p className="text-xs text-muted-foreground">
              If you're not redirected, click the button below.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4 py-20 md:py-32">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin" />
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Payment Pending Approval
              </h1>
              <p className="text-muted-foreground">
                Thank you for registering! We're verifying your payment.
              </p>
            </div>

            {/* Trader Info */}
            {trader && (
              <div className="mb-6 space-y-3 rounded-lg border border-border bg-card/50 p-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Name</p>
                  <p className="font-medium text-foreground">{trader.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Email</p>
                  <p className="font-medium text-foreground text-sm break-all">{trader.email}</p>
                </div>
              </div>
            )}

            {/* Status Box */}
            <div className="mb-6 rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    Status: Pending
                  </p>
                  <p className="text-sm text-amber-600/90 dark:text-amber-400/90">
                    Our admin team is reviewing your payment. This typically takes 5-30 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-foreground">What Happens Next:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Admin verifies your payment</li>
                <li>Your status updates to "Approved"</li>
                <li>You'll automatically be redirected to your dashboard</li>
                <li>You can then access your trading credentials</li>
              </ol>
            </div>

            {/* Auto-Check Info */}
            <div className="mb-6 text-center text-xs text-muted-foreground bg-background rounded-lg p-3">
              <p>Last checked: {lastCheckTime.toLocaleTimeString()}</p>
              <p>Auto-checking every 30 seconds...</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleManualCheck}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Checking..." : "Check Status Now"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium"
              >
                Back to Home
              </button>
            </div>

            {/* Info */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              💡 Keep this page open to get automatic updates. Your status will refresh every 30 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
