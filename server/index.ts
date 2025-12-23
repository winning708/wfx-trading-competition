import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleSyncAll,
  handleSyncIntegration,
  handleSyncStatus,
  handleMT5SyncAll,
  handleMT5SyncIntegration
} from "./routes/sync";

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

  // MT4/MT5 Sync routes
  app.post("/api/sync/mt4/trigger", handleMT4SyncAll);
  app.post("/api/sync/mt4/trigger/:integrationId", handleMT4SyncIntegration);

  return app;
}
