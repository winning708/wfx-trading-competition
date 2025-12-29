import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LeaderboardPage from "@/pages/LeaderboardPage";
import { useUserAuth } from "@/hooks/useUserAuth";

/**
 * Protected route that requires user to be logged in
 * Redirects to login page if user is not authenticated
 */
export function ProtectedUserRoute() {
  const { isAuthenticated, isLoading } = useUserAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Only show loading state for a brief moment
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Still checking authentication
  if (isLoading || showLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - show leaderboard
  return <LeaderboardPage />;
}
