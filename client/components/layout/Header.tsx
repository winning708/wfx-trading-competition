import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === "/register";

  // Initialize based on localStorage to avoid flash
  const [isPaymentApproved, setIsPaymentApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Check if user is registered (has email in localStorage)
        const email = localStorage.getItem("trader_email");
        if (!email) {
          setIsPaymentApproved(false);
          return;
        }

        // Fetch trader from database to check payment status
        const { data, error } = await supabase
          .from("traders")
          .select("payment_status")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          console.error("Error fetching trader status:", error.message || error);
          setIsPaymentApproved(false);
          return;
        }

        if (!data) {
          // User doesn't exist yet or hasn't registered
          setIsPaymentApproved(false);
          return;
        }

        setIsPaymentApproved(data.payment_status === "approved");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error checking payment status:", errorMsg);
        setIsPaymentApproved(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("trader_email");
    setIsPaymentApproved(false);
    navigate("/login");
  };

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
            {isPaymentApproved === true && (
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
          <div className="flex items-center gap-3">
            {isPaymentApproved === true && !isRegisterPage ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors gap-2"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : isPaymentApproved === null ? (
              // Loading state - show nothing while checking
              null
            ) : (
              <Link
                to="/register"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Register Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
