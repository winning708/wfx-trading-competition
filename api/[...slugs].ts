import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../dist/server/production.mjs";

// Create the Express app once (singleton)
let appInstance: any = null;

function getApp() {
  if (!appInstance) {
    appInstance = createServer();
  }
  return appInstance;
}

// Catch-all handler for all /api/* routes
export default async (req: VercelRequest, res: VercelResponse) => {
  const app = getApp();

  console.log("[Vercel API] Incoming request:");
  console.log("  Method:", req.method);
  console.log("  Path:", req.url);
  console.log("  Query:", req.query);
  console.log("  Headers:", {
    "content-type": req.headers["content-type"],
    "content-length": req.headers["content-length"],
  });
  console.log("  Body present:", !!req.body);

  // Ensure body is a string if it exists (Vercel sometimes sends as buffer)
  if (req.body && typeof req.body !== "string") {
    if (Buffer.isBuffer(req.body)) {
      req.body = req.body.toString("utf-8");
      console.log("[Vercel API] Converted buffer body to string");
    } else if (typeof req.body === "object") {
      // It's already parsed (good!)
      console.log("[Vercel API] Body is already parsed object");
    }
  }

  return new Promise<void>((resolve) => {
    // Handle response completion
    const onFinish = () => {
      console.log("[Vercel API] Response sent with status:", res.statusCode);
      res.removeListener("finish", onFinish);
      resolve();
    };

    res.on("finish", onFinish);

    // Pass request to Express
    app(req as any, res as any);

    // Timeout safeguard (Vercel has 26s timeout for Pro, 10s for Hobby)
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error("[Vercel API] Request timeout - sending 504");
        res.status(504).json({ error: "Request timeout" });
      }
      resolve();
    }, 25000);

    res.on("finish", () => {
      clearTimeout(timeout);
    });
  });
};
