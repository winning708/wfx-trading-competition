import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

// Serve static SPA files
const distPath = path.join(__dirname, "dist/spa");
console.log(`📁 Serving SPA from: ${distPath}`);
console.log(`📁 SPA exists: ${fs.existsSync(distPath)}`);

app.use(express.static(distPath));

// Fallback to index.html for SPA routes (regex to avoid /api/* routes)
app.get(/^(?!\/api\/).*/, (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend index.html not found" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📛 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
