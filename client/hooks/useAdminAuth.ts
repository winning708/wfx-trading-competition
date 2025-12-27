import { useState, useEffect } from "react";

/**
 * Hook to check if the current user is authenticated as admin
 */
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated by checking localStorage
    const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
    const adminToken = localStorage.getItem("admin_token");

    setIsAdmin(isAuthenticated && !!adminToken);
    setIsLoading(false);
  }, []);

  return { isAdmin, isLoading };
}
