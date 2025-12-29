// Ensure we can debug startup issues
process.stdout.write("[Server] Initializing...\n");

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.env.PORT || "3000", 10);

// Log all environment variables for debugging (non-secrets)
console.log("[Server] ========== STARTUP DEBUG ==========");
console.log("[Server] Process PID:", process.pid);
console.log("[Server] Working directory:", process.cwd());
console.log("[Server] __dirname:", __dirname);
console.log("[Server] Node version:", process.version);
console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
console.log("[Server] PORT:", port);

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

    // Check environment variables early - CRITICAL FOR STARTUP
    const criticalEnvVars = [
      "VITE_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "ADMIN_PASSWORD",
      "RESEND_API_KEY",
    ];

    console.log("[Server] ========== ENV VARS CHECK ==========");
    const envStatus: Record<string, boolean> = {};
    for (const envVar of criticalEnvVars) {
      const exists = !!process.env[envVar];
      const length = process.env[envVar]?.length || 0;
      envStatus[envVar] = exists;
      console.log(
        `[Server]   - ${envVar}: ${exists ? `✓ (${length} chars)` : "✗ MISSING"}`,
      );
    }

    // Check for Supabase specifically since it's most critical
    if (!process.env.VITE_SUPABASE_URL) {
      throw new Error(
        "CRITICAL: VITE_SUPABASE_URL environment variable is missing. This is required for the server to start.",
      );
    }

    console.log("[Server] ========== IMPORTING SERVER ==========");

    // Import the server module with error handling
    console.log("[Server] Importing createServer from ./server/index.ts...");
    const serverModule = await import("./server/index.ts");
    const { createServer } = serverModule;

    if (!createServer) {
      throw new Error(
        "createServer function not found in server/index.ts",
      );
    }

    console.log("[Server] ✓ createServer imported successfully");
    console.log("[Server] ✓ Creating Express app...");
    const app = createServer();
    console.log("[Server] ✓ Express app created successfully");

    // Verify SPA files exist
    console.log("[Server] ========== SPA FILES CHECK ==========");
    const distPath = path.join(__dirname, "dist/spa");
    console.log(`[Server] Looking for SPA at: ${distPath}`);

    const spaExists = fs.existsSync(distPath);
    console.log(`[Server] dist/spa exists: ${spaExists}`);

    if (spaExists) {
      const indexExists = fs.existsSync(path.join(distPath, "index.html"));
      console.log(`[Server] index.html exists: ${indexExists}`);

      try {
        const files = fs.readdirSync(distPath);
        console.log(`[Server] Files in dist/spa (first 10):`, files.slice(0, 10));
      } catch (err) {
        console.error("[Server] Could not list dist/spa files:", err);
      }
    } else {
      console.warn(
        "[Server] ⚠️  WARNING: dist/spa directory not found - SPA static files won't be served",
      );
    }

    // Setup Express static file serving
    if (spaExists) {
      console.log("[Server] ✓ Setting up static file serving for SPA...");
      app.use(express.static(distPath));
    }

    // Fallback to index.html for SPA routes
    console.log("[Server] Setting up SPA fallback route...");
    app.get("*", (req: any, res: any) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Server] index.html not found at: ${indexPath}`);
        res.status(404).json({ error: "Frontend not found" });
      }
    });

    console.log("[Server] ========== STARTING EXPRESS SERVER ==========");
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`\n========================================`);
      console.log(`✅ SERVER STARTED SUCCESSFULLY`);
      console.log(`========================================`);
      console.log(`🔗 Listening on: http://0.0.0.0:${port}`);
      console.log(`📁 SPA Path: ${distPath}`);
      console.log(`🌍 Public URL: http://wfx-trading-competition-iqk2zw.fly.dev`);
      console.log(`========================================\n`);
    });

    // Handle server errors
    server.on("error", (error: any) => {
      console.error("\n[Server] ========== SERVER ERROR ==========");
      console.error("[Server] An error occurred on the server:");
      console.error("[Server]", error);

      if (error.code === "EADDRINUSE") {
        console.error(
          `[Server] Port ${port} is already in use. Check if another process is running on this port.`,
        );
      } else if (error.code === "EACCES") {
        console.error(
          `[Server] Permission denied to bind to port ${port}. Try a port > 1024.`,
        );
      }

      console.error("[Server] ======================================");
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("\n[Server] SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("[Server] HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("\n[Server] SIGINT signal received: closing HTTP server");
      server.close(() => {
        console.log("[Server] HTTP server closed");
        process.exit(0);
      });
    });

    // Handle any uncaught errors that happen after server starts
    process.on("uncaughtException", (error) => {
      console.error("[Server] ========== UNCAUGHT EXCEPTION ==========");
      console.error("[Server]", error);
      console.error("[Server] ==========================================");
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("[Server] ========== UNHANDLED REJECTION ==========");
      console.error("[Server] Promise:", promise);
      console.error("[Server] Reason:", reason);
      console.error("[Server] ===========================================");
      process.exit(1);
    });
  } catch (error) {
    console.error("\n[Server] ========== STARTUP FAILED ==========");
    console.error("[Server] FATAL ERROR during initialization:");
    console.error("[Server]", error);

    if (error instanceof Error) {
      console.error("[Server] Error message:", error.message);
      console.error("[Server] Stack trace:", error.stack);
    }

    console.error("[Server] =========================================");
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
