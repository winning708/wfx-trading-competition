import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// Properly configured serverless-http handler
export const handler = serverless(app, {
  binary: ["image/*", "font/*"],
  basePath: "/.netlify/functions/api",
});
