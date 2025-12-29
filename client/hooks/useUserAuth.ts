import { useState, useEffect } from "react";

/**
 * Hook to check if the current user is authenticated/registered
 * Checks for trader_email in localStorage (set during login)
 */
export function useUserAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated by checking localStorage
    const email = localStorage.getItem("trader_email");
    
    if (email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
      setIsAuthenticated(false);
      setUserEmail(null);
    }
    
    setIsLoading(false);
  }, []);

  return { 
    isAuthenticated, 
    isLoading, 
    userEmail 
  };
}
