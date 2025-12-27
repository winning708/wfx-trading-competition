import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// serverless-http handler for Netlify Functions
export const handler = serverless(app);
