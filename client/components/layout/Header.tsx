import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    // Check if user is registered (has email in localStorage)
    const email = localStorage.getItem("trader_email");
    setHasCredentials(!!email);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">WFX TRADING</span>
              <span className="text-xs text-muted-foreground">SHOWDOWN</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Leaderboard
            </Link>
            {hasCredentials && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/rules"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Rules
            </Link>
          </nav>

          {/* CTA Button */}
          {!hasCredentials && (
            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Register Now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
