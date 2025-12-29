import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.ts";
import {
  handleSyncAll,
  handleSyncIntegration,
  handleSyncStatus,
  handleMT5SyncAll,
  handleMT5SyncIntegration,
  handleMT5TestConnection,
  handleForexFactorySyncAll,
  handleForexFactorySyncIntegration,
  handleForexFactoryTestConnection,
} from "./routes/sync.ts";
import {
  handleFlutterwaveWebhookRequest,
  handleBinanceWebhookRequest,
  handleBybitWebhookRequest,
  handlePaymentSuccess,
  handlePaymentFailure,
  initiateFlutterwavePayment,
  initiateBinancePayment,
  initiateBybitPayment,
  confirmManualPayment,
} from "./routes/payment.ts";
import {
  sendConfirmationEmail,
  sendPaymentReceipt,
  sendCredentialsEmail,
} from "./routes/email.ts";
import {
  verifyAdminPassword,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  notifyAdminPayment,
  deleteTrader,
  getPaymentSettings,
  updatePaymentSettings,
  getTradersWithPasswords,
  handlePasswordResetRequest,
  getPasswordResetRequests,
  updatePasswordResetRequestStatus,
} from "./routes/admin.ts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add debugging middleware AFTER json parser to log parsed bodies
  app.use((req, res, next) => {
    console.log("[Express] Request processed:");
    console.log("  Method:", req.method);
    console.log("  Path:", req.path);
    console.log("  Body present:", !!req.body);
    if (req.body && typeof req.body === "object") {
      console.log("  Body keys:", Object.keys(req.body));
      if (req.body.password) {
        console.log(
          "  Password in body:",
          "Yes, length:",
          req.body.password.length,
        );
      }
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Test endpoint to verify environment variables
  app.get("/api/test-env", (_req, res) => {
    const adminPasswordSet = !!process.env.ADMIN_PASSWORD;
    const adminPasswordLength = process.env.ADMIN_PASSWORD?.length || 0;
    const adminPasswordFirstChars =
      process.env.ADMIN_PASSWORD?.substring(0, 3) || "";

    res.json({
      adminPasswordExists: adminPasswordSet,
      adminPasswordLength,
      adminPasswordFirstChars,
      allEnvKeys: Object.keys(process.env).filter(
        (k) => k.includes("ADMIN") || k.includes("SUPABASE"),
      ),
    });
  });

  app.get("/api/demo", handleDemo);

  // MyFXBook Sync routes
  app.post("/api/sync/trigger", handleSyncAll);
  app.post("/api/sync/trigger/:integrationId", handleSyncIntegration);
  app.get("/api/sync/status", handleSyncStatus);

  // MT5 Sync routes
  app.post("/api/sync/mt5/trigger", handleMT5SyncAll);
  app.post("/api/sync/mt5/trigger/:integrationId", handleMT5SyncIntegration);
  app.post("/api/sync/mt5/test", handleMT5TestConnection);

  // Forex Factory Sync routes
  app.post("/api/sync/forex-factory/trigger", handleForexFactorySyncAll);
  app.post(
    "/api/sync/forex-factory/trigger/:integrationId",
    handleForexFactorySyncIntegration,
  );
  app.post("/api/sync/forex-factory/test", handleForexFactoryTestConnection);

  // Payment routes
  app.post(
    "/api/payment/webhooks/flutterwave",
    handleFlutterwaveWebhookRequest,
  );
  app.post("/api/payment/webhooks/binance", handleBinanceWebhookRequest);
  app.post("/api/payment/webhooks/bybit", handleBybitWebhookRequest);
  app.get("/api/payment/success", handlePaymentSuccess);
  app.get("/api/payment/failure", handlePaymentFailure);
  app.post("/api/payment/initiate/flutterwave", initiateFlutterwavePayment);
  app.post("/api/payment/initiate/binance", initiateBinancePayment);
  app.post("/api/payment/initiate/bybit", initiateBybitPayment);
  app.post("/api/payment/confirm-manual", confirmManualPayment);

  // Email routes
  app.post("/api/email/send-confirmation", sendConfirmationEmail);
  app.post("/api/email/send-receipt", sendPaymentReceipt);
  app.post("/api/email/send-credentials", sendCredentialsEmail);

  // Admin routes
  app.post("/api/admin/verify-password", verifyAdminPassword);
  app.get("/api/admin/payments/pending", getPendingPayments);
  app.post("/api/admin/payments/:traderId/approve", approvePayment);
  app.post("/api/admin/payments/:traderId/reject", rejectPayment);
  app.post("/api/admin/notify-payment", notifyAdminPayment);
  app.delete("/api/admin/traders/:traderId", deleteTrader);
  app.get("/api/admin/payment-settings", getPaymentSettings);
  app.post("/api/admin/payment-settings", updatePaymentSettings);
  app.get("/api/admin/traders-with-passwords", getTradersWithPasswords);
  app.post("/api/admin/password-reset-request", handlePasswordResetRequest);
  app.get("/api/admin/password-reset-requests", getPasswordResetRequests);
  app.post(
    "/api/admin/password-reset-requests/:requestId/resolve",
    updatePasswordResetRequestStatus,
  );

  return app;
}
