import serverless from "serverless-http";

import { createServer } from "../../server";

const app = createServer();

// Export the handler
export const handler = serverless(app);
