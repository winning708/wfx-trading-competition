import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// serverless-http handler with proper configuration
export const handler = serverless(app);
