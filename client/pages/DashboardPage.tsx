import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { CredentialsCard } from "@/components/credentials/CredentialsCard";
import PagePlaceholder from "@/components/PagePlaceholder";
import {
  getCredentialsByEmail,
  extractEmailFromPaymentRef,
  TraderCredentials,
} from "@/lib/credentials-display";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [credentials, setCredentials] = useState<TraderCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get email from payment reference
        const paymentRef = searchParams.get("ref");
        const paymentSuccess = searchParams.get("payment") === "success";

        let userEmail = email;

        if (paymentRef) {
          userEmail = extractEmailFromPaymentRef(paymentRef);
          setShowPaymentSuccess(paymentSuccess);
        }

        // Try to get email from localStorage (saved during registration)
        if (!userEmail) {
          userEmail = localStorage.getItem("trader_email");
        }

        if (!userEmail) {
          setIsLoading(false);
          return;
        }

        setEmail(userEmail);

        // Fetch credentials for this email
        const creds = await getCredentialsByEmail(userEmail);

        if (creds) {
          setCredentials(creds);
        } else {
          setError("No credentials assigned yet");
        }
      } catch (err) {
        console.error("[Dashboard] Error loading credentials:", err);
        setError("Failed to load credentials");
      } finally {
        setIsLoading(false);
      }
    };

    loadCredentials();
  }, [searchParams, email]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-12 pb-16">
        <div className="container mx-auto px-4">
          {/* Payment Success Alert */}
          {showPaymentSuccess && (
            <div className="mb-8 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900 dark:text-green-200">
                  ✅ Payment Received Successfully!
                </div>
                <div className="text-sm text-green-800 dark:text-green-300 mt-1">
                  Your credentials are now active. You can log in to your trading account anytime.
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading your credentials...</p>
            </div>
          )}

          {/* Credentials Display */}
          {!isLoading && credentials && (
            <div>
              <CredentialsCard credentials={credentials} />
            </div>
          )}

          {/* No Credentials State */}
          {!isLoading && !credentials && !error && (
            <PagePlaceholder
              title="Trader Dashboard"
              description="Your trading credentials will appear here once you complete payment and they are assigned by the admin."
            />
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="max-w-2xl mx-auto">
              <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-900 dark:text-yellow-200">
                      Credentials Not Yet Available
                    </div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-2">
                      <p>
                        {error === "No credentials assigned yet"
                          ? "Your payment has been received, but your credentials are still being prepared. The admin will assign your trading account shortly. Please check back in a few moments."
                          : error}
                      </p>
                      <p className="text-xs">
                        If you continue to see this message after 30 minutes, please contact support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Email Entry (for testing/access without payment) */}
          {!isLoading && !credentials && email === null && !error && (
            <div className="max-w-2xl mx-auto mt-8">
              <ManualEmailEntry onEmailSubmit={setEmail} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Manual email entry for testing/accessing credentials
 */
function ManualEmailEntry({ onEmailSubmit }: { onEmailSubmit: (email: string) => void }) {
  const [inputEmail, setInputEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      onEmailSubmit(inputEmail.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-6 bg-card rounded-lg border border-border">
        <label className="block text-sm font-medium mb-2">Enter Your Email</label>
        <input
          type="email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="your-email@example.com"
          className="w-full px-4 py-2 rounded border border-input bg-background text-foreground mb-4"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition"
        >
          View Credentials
        </button>
      </div>
    </form>
  );
}
