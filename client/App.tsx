import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import RulesPage from "./pages/RulesPage";
import MonitoringPage from "./pages/MonitoringPage";
import WinnersPage from "./pages/WinnersPage";
import NotFound from "./pages/NotFound";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedUserRoute } from "./components/ProtectedUserRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/leaderboard" element={<ProtectedUserRoute />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/admin" element={<ProtectedAdminRoute />} />
          <Route path="/winners" element={<WinnersPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.hasChildNodes()) {
  createRoot(rootElement).render(<App />);
}
