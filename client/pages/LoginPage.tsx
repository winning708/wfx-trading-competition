import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle, Mail, ArrowRight, Loader } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userStatus, setUserStatus] = useState<{
    fullName: string;
    email: string;
    paymentStatus: string;
    registered: boolean;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUserStatus(null);

    if (!credential.trim()) {
      setError("Please enter your email or username");
      return;
    }

    setIsLoading(true);

    try {
      // Check if it's an email or username
      const isEmail = credential.includes("@");

      // Check if user exists by email or username
      const { data: trader, error: fetchError } = await supabase
        .from("traders")
        .select("id, full_name, email, username, payment_status")
        .or(isEmail ? `email.eq.${credential.toLowerCase().trim()}` : `username.eq.${credential.toLowerCase().trim()}`)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching trader:", fetchError);
        setError("Error checking your account. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!trader) {
        // User doesn't exist
        setError(isEmail ? "Email not found. Please register to create an account." : "Username not found. Please register to create an account.");
        setIsLoading(false);
        return;
      }

      // User found
      setUserStatus({
        fullName: trader.full_name,
        email: trader.email,
        paymentStatus: trader.payment_status,
        registered: true,
      });

      // Save email to localStorage
      localStorage.setItem("trader_email", trader.email);

      // Redirect based on payment status
      if (trader.payment_status === "approved") {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else if (trader.payment_status === "pending") {
        setSuccess(true);
        setTimeout(() => {
          navigate("/pending-approval");
        }, 1500);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Login error:", errorMsg);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-4 py-20 md:py-32">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground">
                Log in to access your trading account
              </p>
            </div>

            {/* Success State */}
            {success && userStatus && (
              <div className="rounded-lg border-2 border-success/50 bg-success/10 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success">Welcome, {userStatus.fullName}!</p>
                    <p className="text-xs text-success/80">
                      {userStatus.paymentStatus === "approved"
                        ? "Redirecting to your dashboard..."
                        : userStatus.paymentStatus === "pending"
                        ? "Redirecting to approval status..."
                        : "Redirecting..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Login Failed</p>
                    <p className="text-sm text-destructive/90">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            {!success && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="credential" className="block text-sm font-medium text-foreground mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="credential"
                      type="text"
                      placeholder="your@email.com or username"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !credential.trim()}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            {!success && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">New to WFX?</span>
                </div>
              </div>
            )}

            {/* Register Link */}
            {!success && (
              <button
                onClick={() => navigate("/register")}
                className="w-full px-4 py-2 rounded-lg border-2 border-primary bg-transparent text-primary hover:bg-primary/10 transition-colors font-semibold"
              >
                Create New Account
              </button>
            )}

            {/* Info Box */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>💡 Tip:</strong> Use the email address you registered with to log back in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
