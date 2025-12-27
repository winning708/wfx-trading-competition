import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create the Express app once (singleton)
let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    // Dynamically import at runtime to avoid bundler issues
    const { createServer } = await import("../dist/server/production.mjs");
    appInstance = createServer();
  }
  return appInstance;
}

// Catch-all handler for all /api/* routes
export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await getApp();

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
    // Timeout safeguard (Vercel has 26s timeout for Pro, 10s for Hobby)
    let timeoutHandle: NodeJS.Timeout | null = null;

    const onFinish = () => {
      console.log("[Vercel API] Response sent with status:", res.statusCode);
      res.removeListener("finish", onFinish);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      resolve();
    };

    res.on("finish", onFinish);

    // Pass request to Express
    app(req as any, res as any);

    timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        console.error("[Vercel API] Request timeout - sending 504");
        res.status(504).json({ error: "Request timeout" });
      }
    }, 25000);
  });
};
