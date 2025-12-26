import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminPage from "@/pages/AdminPage";

export function ProtectedAdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem("admin_token");
    const adminAuth = localStorage.getItem("admin_authenticated");
    
    if (adminToken && adminAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Still checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Authenticated - show admin panel
  return <AdminPage />;
}
