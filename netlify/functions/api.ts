import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// Create the serverless handler
const handler = serverless(app, {
  // Use v2 compatibility mode
  v2: false,
  request: (request: any, event: any) => {
    console.log("[Netlify/serverless-http] Request event:");
    console.log("  httpMethod:", event.httpMethod);
    console.log("  path:", event.path);
    console.log("  body present:", !!event.body);
    console.log("  isBase64Encoded:", event.isBase64Encoded);

    // Ensure headers object exists
    if (!event.headers) {
      event.headers = {};
    }

    // Handle body parsing
    if (event.body) {
      // Decode if base64 encoded
      if (event.isBase64Encoded) {
        event.body = Buffer.from(event.body, "base64").toString("utf-8");
        console.log("[Netlify/serverless-http] Decoded base64 body");
      }

      // Ensure Content-Length is set
      const bodyLength = Buffer.byteLength(event.body);
      if (!event.headers["content-length"]) {
        event.headers["content-length"] = bodyLength.toString();
      }

      console.log(
        "[Netlify/serverless-http] Final body:",
        event.body.substring(0, 100),
      );
    }
  },
});

// Export the handler
export { handler };
