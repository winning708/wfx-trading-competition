import { Handler } from "@netlify/functions";
import { createServer } from "../../server";

const app = createServer();

// Custom Netlify handler that properly parses the body
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  return new Promise((resolve) => {
    // Convert Netlify event to Node.js request-like object
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers || {},
      body: event.body ? JSON.parse(event.body) : {},
      on: () => {}, // Add dummy event listener
      once: () => {}, // Add dummy once
    } as any;

    // Create response object
    const responseData: any = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: "",
    };

    const res = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      json: (data: any) => {
        responseData.body = JSON.stringify(data);
        responseData.statusCode = res.statusCode;
        responseData.headers = res.headers;
        resolve(responseData);
      },
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      send: function (data: any) {
        if (typeof data === "string") {
          responseData.body = data;
        } else {
          responseData.body = JSON.stringify(data);
        }
        responseData.statusCode = this.statusCode;
        responseData.headers = this.headers;
        resolve(responseData);
      },
      setHeader: function (key: string, value: string) {
        this.headers[key] = value;
      },
    } as any;

    // Handle the request
    try {
      // Call Express app as middleware
      app(req, res, (err: any) => {
        if (err) {
          console.error("[Handler] Error:", err);
          resolve({
            statusCode: 500,
            headers: responseData.headers,
            body: JSON.stringify({ error: "Internal server error" }),
          });
        }
      });
    } catch (error) {
      console.error("[Handler] Caught error:", error);
      resolve({
        statusCode: 500,
        headers: responseData.headers,
        body: JSON.stringify({ error: "Internal server error" }),
      });
    }
  });
};
