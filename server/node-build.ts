import path from "path";
import { createServer } from "./index";
import * as express from "express";
import fs from "fs";

const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../dist/spa");

console.log("[Server] Dist path:", distPath);
console.log("[Server] Dist path exists:", fs.existsSync(distPath));
console.log("[Server] Dist contents:", fs.readdirSync(distPath).slice(0, 10));

const app = createServer();

// Serve static files BEFORE the catch-all route
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
// This catch-all should only handle SPA routes, NOT API routes
app.get("*", (req, res) => {
  // Ensure we only serve index.html for actual SPA routes, not API
  if (req.path.startsWith("/api/")) {
    console.warn("[Server] API route not found:", req.path);
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");
  console.log("[Server] Serving index.html for route:", req.path);

  if (!fs.existsSync(indexPath)) {
    console.error("[Server] index.html not found at:", indexPath);
    return res.status(404).json({ error: "Frontend not found" });
  }

  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
