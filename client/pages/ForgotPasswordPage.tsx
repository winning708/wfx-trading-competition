import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Notify admin about password reset request
      const response = await fetch("/api/admin/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to process request");
        return;
      }

      setSuccess(true);
      setEmail("");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Error sending reset request:", errorMsg);
      setError(
        "An error occurred. Please try again or contact support directly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-success/50 bg-success/10 p-8 text-center space-y-4">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-success">
                Request Received!
              </h2>
              <p className="text-sm text-success/90">
                We've received your password reset request. Our admin team will
                contact you at {email} within 24 hours with instructions to
                reset your password.
              </p>

              <div className="bg-background rounded p-4 mt-6 text-left space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  What Happens Next:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Admin verifies your identity</li>
                  <li>You receive instructions via email</li>
                  <li>Follow the link to reset your password</li>
                </ol>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Redirecting to login in a moment...
              </p>
            </div>
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
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground">
              Enter your email and we'll help you regain access to your account
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-border bg-card p-8 space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  ✕ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter the email address associated with your account
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full h-12 rounded-lg text-base font-semibold transition-colors ${
                  isLoading || !email
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Sending Request...
                  </span>
                ) : (
                  "Send Password Reset Request"
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                ℹ️ How This Works
              </p>
              <p className="text-xs text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
                Our admin team will receive your request and verify your
                identity. Once confirmed, they'll send you detailed instructions
                to reset your password securely.
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <button
            onClick={() => navigate("/login")}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-card/50 transition-colors text-foreground text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          {/* Footer Info */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
