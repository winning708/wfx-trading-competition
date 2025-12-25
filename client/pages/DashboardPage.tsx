import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Copy, Check, LogOut, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Trader {
  id: string;
  full_name: string;
  email: string;
  payment_status?: string;
}

interface TradingCredential {
  id: string;
  account_username: string;
  account_password: string;
  account_number: string;
  broker: string;
}

interface CredentialAssignment {
  id: string;
  trader_id: string;
  credential_id: string;
  assigned_at: string;
  credential?: TradingCredential;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [assignment, setAssignment] = useState<CredentialAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraderData = async () => {
      try {
        // Get trader email from localStorage
        const traderEmail = localStorage.getItem("trader_email");
        if (!traderEmail) {
          setError("No trader session found. Please register first.");
          setIsLoading(false);
          return;
        }

        // Fetch trader details
        const { data: traderData, error: traderError } = await supabase
          .from("traders")
          .select("id, full_name, email, payment_status")
          .eq("email", traderEmail)
          .maybeSingle();

        if (traderError) {
          console.error("Error fetching trader:", traderError.message || traderError);
          setError("Trader not found");
          setIsLoading(false);
          return;
        }

        if (!traderData) {
          console.error("Trader not found - no data returned");
          setError("Trader not found");
          setIsLoading(false);
          return;
        }

        // Check if payment is approved FIRST
        const paymentStatus = traderData?.payment_status;
        if (paymentStatus !== 'approved') {
          setError("Your payment is still pending approval by our admin team. Once approved, you'll be able to access your trading credentials. Please check back soon.");
          setIsLoading(false);
          return;
        }

        setTrader(traderData);

        // Fetch credential assignment with credential details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("credential_assignments")
          .select(`
            id,
            trader_id,
            credential_id,
            assigned_at,
            trading_credentials(
              id,
              account_username,
              account_password,
              account_number,
              broker
            )
          `)
          .eq("trader_id", traderData.id)
          .maybeSingle();

        if (assignmentError) {
          console.error("Error fetching assignment:", assignmentError.message || assignmentError);
          setError("Could not load your credentials");
          setIsLoading(false);
          return;
        }

        if (!assignmentData) {
          setError("No trading credentials assigned yet. Please contact support.");
          setIsLoading(false);
          return;
        }

        setAssignment(assignmentData as CredentialAssignment);
        setIsLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error in dashboard:", errorMsg);
        setError(errorMsg);
        setIsLoading(false);
      }
    };

    fetchTraderData();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("trader_email");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading your credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isPendingPayment = error.includes("pending approval");

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-md">
            <div className={`rounded-lg border p-6 ${isPendingPayment ? 'border-amber-500/50 bg-amber-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
              <p className={`text-lg font-semibold mb-2 ${isPendingPayment ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'}`}>
                {isPendingPayment ? '⏳ Payment Pending Approval' : '❌ Error'}
              </p>
              <p className={`text-sm mb-4 ${isPendingPayment ? 'text-amber-600/90 dark:text-amber-400/90' : 'text-destructive/90'}`}>
                {error}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Back to Home
                </button>
                {isPendingPayment && (
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium"
                  >
                    Check Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trader || !assignment?.trading_credentials) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-lg font-semibold text-foreground mb-2">No Credentials Found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Your trading credentials have not been assigned yet. Please contact support.
              </p>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const credential = assignment.trading_credentials as TradingCredential;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome, {trader.full_name}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Your trading credentials for the WFX Trading Competition
            </p>
          </div>

          {/* Payment Approved Banner */}
          {trader.payment_status === 'approved' && (
            <div className="mb-8 rounded-lg border-2 border-success/50 bg-success/10 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="font-semibold text-success mb-1">Payment Approved!</p>
                  <p className="text-sm text-success/90">
                    Your payment has been approved by our admin team. Your trading credentials are ready below. You can now access the platform and start trading!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Card */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 md:p-8 space-y-6 mb-8">
            {/* Broker Section */}
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Trading Platform
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {credential.broker}
              </p>
            </div>

            <div className="border border-border"></div>

            {/* Account Number */}
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Account Number
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background rounded-lg px-4 py-3 font-mono text-sm md:text-base text-foreground break-all border border-border">
                  {credential.account_number}
                </code>
                <button
                  onClick={() => handleCopy(credential.account_number, "account_number")}
                  className="flex-shrink-0 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Copy account number"
                >
                  {copiedField === "account_number" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Username
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background rounded-lg px-4 py-3 font-mono text-sm md:text-base text-foreground break-all border border-border">
                  {credential.account_username}
                </code>
                <button
                  onClick={() => handleCopy(credential.account_username, "username")}
                  className="flex-shrink-0 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Copy username"
                >
                  {copiedField === "username" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Password
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background rounded-lg px-4 py-3 font-mono text-sm md:text-base text-foreground break-all border border-border">
                  {showPassword ? credential.account_password : "●".repeat(credential.account_password.length)}
                </code>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 p-3 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-foreground" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(credential.account_password, "password")}
                  className="flex-shrink-0 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Copy password"
                >
                  {copiedField === "password" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 md:p-6 mb-6 space-y-3">
            <p className="text-sm md:text-base text-blue-600 dark:text-blue-400">
              <strong>✓ Your credentials are ready!</strong>
            </p>
            <div className="text-xs md:text-sm text-blue-600/90 dark:text-blue-400/90 space-y-2">
              <p>
                <strong>Next Steps:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Download MT4 or MT5 from your broker's website</li>
                <li>Launch the platform and select {credential.broker}</li>
                <li>Click "Login" and enter your credentials above</li>
                <li>Start trading and monitor your progress on the leaderboard</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/leaderboard")}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
            >
              View Leaderboard →
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-card/50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
