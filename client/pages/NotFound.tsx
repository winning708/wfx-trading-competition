import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="404 - Page Not Found"
          description="The page you're looking for doesn't exist. Let's get you back on track!"
        />
      </div>
    </div>
  );
};

export default NotFound;
