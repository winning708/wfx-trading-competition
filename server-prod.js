const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Serve static SPA files
const distPath = path.join(__dirname, "dist/spa");
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

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
