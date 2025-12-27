import serverless from "serverless-http";

import { createServer } from "../../server";

const app = createServer();

// Export the handler with proper body parsing
export const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
  shouldIgnoreTrailingSlash: false,
});
