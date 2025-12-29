// Ensure we can debug startup issues
process.stdout.write("[Server] Initializing...\n");

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Load dotenv only in development
    if (process.env.NODE_ENV !== "production") {
      try {
        await import("dotenv/config");
        console.log("[Server] Loaded dotenv for development");
      } catch (err) {
        console.log("[Server] dotenv not available, skipping");
      }
    }

    console.log("[Server] Starting production server...");
    console.log("[Server] Node version:", process.version);
    console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
    console.log("[Server] PORT:", port);

    // Log critical env vars (without values for security)
    const criticalEnvVars = [
      "VITE_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "ADMIN_PASSWORD",
      "RESEND_API_KEY",
    ];
    console.log("[Server] Environment variables check:");
    for (const envVar of criticalEnvVars) {
      const exists = !!process.env[envVar];
      const length = process.env[envVar]?.length || 0;
      console.log(`[Server]   - ${envVar}: ${exists ? `✓ (${length} chars)` : "✗ MISSING"}`);
    }

    console.log("[Server] Importing createServer...");
    const { createServer } = await import("./server/index.ts");
    console.log("[Server] Creating Express app...");
    const app = createServer();
    console.log("[Server] Express app created successfully");

    // Serve static SPA files
    const distPath = path.join(__dirname, "dist/spa");
    console.log(`[Server] Serving SPA from: ${distPath}`);
    console.log(`[Server] SPA exists: ${fs.existsSync(distPath)}`);

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      console.log("[Server] Static file serving configured");
    }

    // Fallback to index.html for SPA routes
    app.get("*", (req: any, res: any) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Server] index.html not found at: ${indexPath}`);
        res.status(404).json({ error: "Frontend not found" });
      }
    });

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`\n✅ Server running successfully!`);
      console.log(`🔗 Listening on: 0.0.0.0:${port}`);
      console.log(`📁 SPA: ${distPath}`);
      console.log("[Server] Ready to accept connections\n");
    });

    // Handle server errors
    server.on("error", (error: any) => {
      console.error("[Server] Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`[Server] Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("[Server] SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("[Server] SIGINT received, shutting down...");
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("[Server] FATAL ERROR:", error);
    if (error instanceof Error) {
      console.error("[Server] Error message:", error.message);
      console.error("[Server] Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[Server] Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});
