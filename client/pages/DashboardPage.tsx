import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Copy, Check, LogOut, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { hasCompetitionStarted, getFormattedCompetitionStartDate, getTimeUntilStart } from "@/lib/competition";

interface Trader {
  id: string;
  full_name: string;
  email: string;
  payment_status?: string;
  trader_password?: string;
}

interface TradingCredential {
  id: string;
  account_username: string;
  account_password: string;
  account_number: string;
  broker: string;
  server_name: string;
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [competitionStarted, setCompetitionStarted] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState(getTimeUntilStart());

  // Update competition status
  useEffect(() => {
    setCompetitionStarted(hasCompetitionStarted());

    // Update time remaining every second
    const interval = setInterval(() => {
      setCompetitionStarted(hasCompetitionStarted());
      setTimeUntilStart(getTimeUntilStart());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
          .select("id, full_name, email, payment_status, trader_password")
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
              broker,
              server_name
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!newPassword.trim()) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!trader) return;

    setIsChangingPassword(true);

    try {
      const { error: updateError } = await supabase
        .from("traders")
        .update({ trader_password: newPassword })
        .eq("id", trader.id);

      if (updateError) {
        console.error("Error updating password:", updateError);
        setPasswordError("Failed to update password. Please try again.");
        return;
      }

      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmNewPassword("");
      setShowChangePassword(false);

      // Update trader object with new password
      if (trader) {
        setTrader({ ...trader, trader_password: newPassword });
      }

      // Show success message for 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Error changing password:", errorMsg);
      setPasswordError(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
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
          {trader.payment_status === 'approved' && !competitionStarted && (
            <div className="mb-8 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📋</div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-600 mb-1">Payment Approved - Ready for Competition!</p>
                  <p className="text-sm text-blue-600/90">
                    Your payment has been approved. Your credentials are reserved below. You'll be able to access your password once the competition starts on <strong>{getFormattedCompetitionStartDate()}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Approved Banner (Competition Started) */}
          {trader.payment_status === 'approved' && competitionStarted && (
            <div className="mb-8 rounded-lg border-2 border-success/50 bg-success/10 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="font-semibold text-success mb-1">Payment Approved! Competition Started!</p>
                  <p className="text-sm text-success/90">
                    Your trading credentials are now fully available. Log in to your trading platform and start trading!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Card */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 md:p-8 space-y-6 mb-8">
            {!competitionStarted && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 md:p-4 -mt-3 -mx-3 -mt-6 rounded-b-none">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-blue-600">
                    Your account number and username are available now. Your password will unlock on <strong>{getFormattedCompetitionStartDate()}</strong> to prevent early trading.
                  </p>
                </div>
              </div>
            )}
            {/* Broker Section */}
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Trading Platform
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {credential.broker}
              </p>
            </div>

            {/* Server Name */}
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                Server
              </p>
              <p className="text-lg md:text-xl font-semibold text-foreground font-mono">
                {credential.server_name}
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

              {!competitionStarted ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-600 mb-1">
                        Password locked until competition starts
                      </p>
                      <p className="text-xs text-amber-600/80 mb-3">
                        Your password will be available once the competition begins on <strong>{getFormattedCompetitionStartDate()}</strong>.
                        This ensures fair play for all participants.
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-medium text-amber-600">
                        <div>
                          <span className="text-lg font-bold">{String(timeUntilStart.days).padStart(2, '0')}</span>
                          <span className="text-xs"> days</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{String(timeUntilStart.hours).padStart(2, '0')}</span>
                          <span className="text-xs"> hours</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{String(timeUntilStart.minutes).padStart(2, '0')}</span>
                          <span className="text-xs"> minutes</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{String(timeUntilStart.seconds).padStart(2, '0')}</span>
                          <span className="text-xs"> seconds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mb-8">
            {!showChangePassword ? (
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full px-4 py-3 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium text-foreground text-left flex items-center justify-between"
              >
                <span>🔐 Manage Your Account Password</span>
                <span className="text-xs text-muted-foreground">Click to change</span>
              </button>
            ) : (
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Change Your Password</h3>
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordError(null);
                      setNewPassword("");
                      setConfirmNewPassword("");
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {passwordSuccess && (
                  <div className="rounded-lg border border-success/50 bg-success/10 p-4">
                    <p className="text-sm font-medium text-success">✓ Password updated successfully!</p>
                  </div>
                )}

                {passwordError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm font-medium text-destructive">✕ {passwordError}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordError(null);
                        setNewPassword("");
                        setConfirmNewPassword("");
                      }}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
