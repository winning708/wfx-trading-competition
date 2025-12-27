import { createServer } from "../../server";
import type { Handler } from "@netlify/functions";

const app = createServer();

// Map to store active responses
const responseMap = new Map<string, any>();

export const handler: Handler = async (event, context) => {
  console.log("[API Handler] Received event:", {
    httpMethod: event.httpMethod,
    path: event.path,
    bodyIsPresent: !!event.body,
    isBase64Encoded: event.isBase64Encoded,
  });

  return new Promise((resolve) => {
    // Decode body if needed
    let bodyString = event.body || "";
    if (event.isBase64Encoded && bodyString) {
      bodyString = Buffer.from(bodyString, "base64").toString("utf-8");
    }

    console.log("[API Handler] Decoded body:", bodyString);

    // Parse the body
    let bodyData: any = {};
    if (bodyString) {
      try {
        bodyData = JSON.parse(bodyString);
        console.log("[API Handler] Parsed body data:", bodyData);
      } catch (e) {
        console.error("[API Handler] Failed to parse body:", e);
      }
    }

    // Create a mock request object
    const mockReq = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers || {},
      body: bodyData,
      query: event.queryStringParameters || {},
    } as any;

    // Variable to store response data
    let responseData: any = null;

    // Create a mock response object
    const mockRes = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      json: function (data: any) {
        responseData = {
          statusCode: this.statusCode,
          headers: this.headers,
          body: JSON.stringify(data),
        };
        console.log("[API Handler] Sending JSON response:", responseData);
        resolve(responseData);
      },
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      send: function (data: any) {
        const body = typeof data === "string" ? data : JSON.stringify(data);
        responseData = {
          statusCode: this.statusCode,
          headers: this.headers,
          body,
        };
        console.log("[API Handler] Sending response:", responseData);
        resolve(responseData);
      },
      setHeader: function (key: string, value: string) {
        this.headers[key] = value;
      },
    } as any;

    // Call Express app
    try {
      app(mockReq, mockRes, (err: any) => {
        if (err) {
          console.error("[API Handler] Express middleware error:", err);
          if (!responseData) {
            responseData = {
              statusCode: 500,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ error: "Internal server error" }),
            };
            resolve(responseData);
          }
        }
      });

      // Set a timeout to resolve if no response was sent
      setTimeout(() => {
        if (!responseData) {
          console.warn("[API Handler] Response timeout");
          responseData = {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Request timeout" }),
          };
          resolve(responseData);
        }
      }, 25000);
    } catch (error) {
      console.error("[API Handler] Caught error:", error);
      resolve({
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      });
    }
  });
};
