import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server';

// Create the Express app once
const app = createServer();

// Handler for Vercel Serverless Functions
export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('[Vercel Handler] Incoming request:');
  console.log('  Method:', req.method);
  console.log('  Path:', req.url);
  console.log('  Headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
  });
  console.log('  Body present:', !!req.body);
  console.log('  Body type:', typeof req.body);

  if (req.body) {
    console.log('  Body sample:', JSON.stringify(req.body).substring(0, 100));
  }

  // Use Express to handle the request
  return new Promise<void>((resolve, reject) => {
    // Mark that a response was sent
    let responseSent = false;

    // Override res.end to detect when response is actually sent
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      responseSent = true;
      console.log('[Vercel Handler] Response ended with status:', res.statusCode);
      originalEnd.apply(res, args);
      resolve();
    };

    // Call the Express app
    app(req as any, res as any);

    // Timeout to prevent hanging
    setTimeout(() => {
      if (!responseSent) {
        console.warn('[Vercel Handler] Response timeout - sending 504');
        res.status(504).json({ error: 'Gateway timeout' });
        resolve();
      }
    }, 25000); // Vercel has 26s timeout, we use 25s
  });
};
