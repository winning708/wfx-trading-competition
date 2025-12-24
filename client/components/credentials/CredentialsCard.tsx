import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TraderCredentials } from "@/lib/credentials-display";

interface CredentialsCardProps {
  credentials: TraderCredentials;
}

export function CredentialsCard({ credentials }: CredentialsCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CredentialField = ({
    label,
    value,
    isSensitive = false,
  }: {
    label: string;
    value: string;
    isSensitive?: boolean;
  }) => (
    <div className="space-y-2 p-4 bg-secondary/50 rounded-lg border border-border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <code className="text-sm font-mono bg-background px-3 py-2 rounded border border-border block break-all">
            {isSensitive && !showPassword ? "••••••••••••••••" : value}
          </code>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(value, label)}
          className="flex-shrink-0"
        >
          {copiedField === label ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Your Trading Credentials</h2>
        <p className="text-muted-foreground">
          Use these details to log into your {credentials.broker} trading account
        </p>
      </div>

      {/* Trader Info */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Account Owner
            </div>
            <div className="text-lg font-semibold">{credentials.trader_name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Email Address
            </div>
            <div className="text-sm font-mono">{credentials.trader_email}</div>
          </div>
        </div>
      </div>

      {/* Credentials Fields */}
      <div className="space-y-4">
        <CredentialField label="Broker" value={credentials.broker} />
        <CredentialField label="Account Number" value={credentials.account_number} />
        <CredentialField label="Username" value={credentials.account_username} />

        {/* Password with toggle */}
        <div className="space-y-2 p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPassword(!showPassword)}
              className="h-8 px-2"
            >
              {showPassword ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <code className="text-sm font-mono bg-background px-3 py-2 rounded border border-border block break-all">
                {showPassword ? credentials.account_password : "••••••••••••••••"}
              </code>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(credentials.account_password, "Password")}
              className="flex-shrink-0"
            >
              {copiedField === "Password" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {credentials.notes && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <div className="font-semibold mb-1">📝 Notes:</div>
            {credentials.notes}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30 space-y-3">
        <div className="font-semibold text-blue-900 dark:text-blue-200">🚀 Getting Started:</div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li>Download MT4 or MT5 from your broker's website</li>
          <li>Launch the platform and search for "{credentials.broker}"</li>
          <li>Click "Login" and use your Account Number and Password</li>
          <li>Start trading and monitor your progress on the leaderboard</li>
        </ol>
      </div>

      {/* Security Warning */}
      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
        <div className="text-sm text-red-800 dark:text-red-200">
          <div className="font-semibold mb-2">⚠️ Security Notice:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Keep your credentials confidential and never share them</li>
            <li>Do not give your password to anyone, including support staff</li>
            <li>Change your password immediately if you suspect unauthorized access</li>
            <li>Save these credentials in a secure location</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
