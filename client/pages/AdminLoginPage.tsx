import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { AlertCircle, Lock, ArrowRight, Loader } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('[AdminLogin] Login attempt');
    console.log('[AdminLogin] Password value:', password);
    console.log('[AdminLogin] Password length:', password.length);
    console.log('[AdminLogin] Password trimmed:', password.trim());

    if (!password || !password.trim()) {
      console.log('[AdminLogin] Password is empty');
      setError("Please enter the admin password");
      return;
    }

    setIsLoading(true);

    try {
      const passwordToSend = password.trim();
      console.log('[AdminLogin] Sending password, length:', passwordToSend.length);

      const response = await fetch("/.netlify/functions/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordToSend }),
      });

      console.log('[AdminLogin] Response status:', response.status);
      const data = await response.json();
      console.log('[AdminLogin] Response data:', data);

      if (data.success) {
        // Store admin token in localStorage
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_authenticated", "true");
        console.log('[AdminLogin] ✅ Login successful, redirecting to /admin');
        // Redirect to admin panel
        navigate("/admin");
      } else {
        console.log('[AdminLogin] Login failed:', data.message);
        setError(data.message || "Incorrect admin password");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[AdminLogin] Error:", errorMsg, err);
      setError("An error occurred. Please try again.");
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
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the admin password to access the control panel
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Access Denied</p>
                    <p className="text-sm text-destructive/90">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Access Panel
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>🔐 Secure Access:</strong> Your admin password is required to access the admin control panel. Keep it secret and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
