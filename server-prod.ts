import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from "./server/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = createServer();
const port = process.env.PORT || 3000;

// Serve static SPA files
const distPath = path.join(__dirname, "dist/spa");
console.log(`📁 Serving SPA from: ${distPath}`);
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend not found" });
  }
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on 0.0.0.0:${port}`);
  console.log(`🌐 URL: http://0.0.0.0:${port}`);
  console.log(`📁 SPA: ${distPath}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📛 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
