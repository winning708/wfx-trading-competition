import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// Wrap the Express app with serverless-http handler
const baseHandler = serverless(app);

// Enhanced handler for Netlify Functions v2 with explicit body parsing
export const handler = async (event: any, context: any) => {
  console.log('[Netlify Handler] Incoming request:');
  console.log('  Method:', event.httpMethod);
  console.log('  Path:', event.path);
  console.log('  Headers:', event.headers);
  console.log('  Body present:', !!event.body);
  console.log('  Body length:', event.body?.length);
  console.log('  isBase64Encoded:', event.isBase64Encoded);

  // If there's a body but serverless-http might not handle it properly,
  // we need to ensure it's decoded and available
  if (event.body) {
    let bodyContent = event.body;
    if (event.isBase64Encoded) {
      bodyContent = Buffer.from(event.body, 'base64').toString('utf-8');
      console.log('[Netlify Handler] Decoded base64 body');
    }

    // Replace the body with the decoded version
    event.body = bodyContent;

    // Update Content-Length header to reflect actual body size
    if (!event.headers['content-length']) {
      event.headers['content-length'] = Buffer.byteLength(bodyContent).toString();
    }

    console.log('[Netlify Handler] Final body:', bodyContent.substring(0, 200));
  }

  // Call the serverless handler
  const response = await baseHandler(event, context);

  console.log('[Netlify Handler] Response status:', response.statusCode);

  return response;
};
