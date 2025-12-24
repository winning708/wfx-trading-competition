import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
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
} from "./routes/sync";
import {
  handleFlutterwaveWebhookRequest,
  handleBinanceWebhookRequest,
  handleBybitWebhookRequest,
  handlePaymentSuccess,
  handlePaymentFailure,
  initiateFlutterwavePayment,
  initiateBinancePayment,
  initiateBybitPayment,
} from "./routes/payment";
import {
  sendConfirmationEmail,
  sendPaymentReceipt,
  sendCredentialsEmail,
} from "./routes/email";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
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
  app.post("/api/sync/forex-factory/trigger/:integrationId", handleForexFactorySyncIntegration);
  app.post("/api/sync/forex-factory/test", handleForexFactoryTestConnection);

  // Payment routes
  app.post("/api/payment/webhooks/flutterwave", handleFlutterwaveWebhookRequest);
  app.post("/api/payment/webhooks/binance", handleBinanceWebhookRequest);
  app.post("/api/payment/webhooks/bybit", handleBybitWebhookRequest);
  app.get("/api/payment/success", handlePaymentSuccess);
  app.get("/api/payment/failure", handlePaymentFailure);
  app.post("/api/payment/initiate/flutterwave", initiateFlutterwavePayment);
  app.post("/api/payment/initiate/binance", initiateBinancePayment);
  app.post("/api/payment/initiate/bybit", initiateBybitPayment);

  // Email routes
  app.post("/api/email/send-confirmation", sendConfirmationEmail);
  app.post("/api/email/send-receipt", sendPaymentReceipt);

  return app;
}
