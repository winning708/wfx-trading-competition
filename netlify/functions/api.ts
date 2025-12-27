import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// Custom handler for Netlify Functions v2
export const handler = serverless(app, {
  // Enable proper request body handling
  request(request: any, event: any, context: any) {
    // Ensure the body is properly available to Express
    if (event.body && !request.body) {
      // Handle base64 encoded bodies
      if (event.isBase64Encoded) {
        request.body = Buffer.from(event.body, 'base64').toString('utf-8');
      } else {
        request.body = event.body;
      }
    }

    // Log for debugging
    console.log('[Netlify] Request details:');
    console.log('  Method:', request.method);
    console.log('  Path:', request.path || request.url);
    console.log('  Headers:', {
      'content-type': request.headers['content-type'],
      'content-length': request.headers['content-length'],
    });
    console.log('  Body exists:', !!request.body);
    if (request.body) {
      console.log('  Body type:', typeof request.body);
      console.log('  Body length:', request.body.length);
    }
  },
});
