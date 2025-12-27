import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server';

const app = createServer();

// Handler for Vercel Serverless Functions
export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('[Vercel] Incoming request:');
  console.log('  Method:', req.method);
  console.log('  Path:', req.url);
  console.log('  Headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
  });
  console.log('  Body present:', !!req.body);
  
  // Express app expects Node.js http.IncomingMessage and http.ServerResponse
  // Vercel's req/res are compatible, but we need to handle the routing manually
  
  // Create a simple routing handler
  return new Promise<void>((resolve) => {
    app(req, res as any);
    
    // Ensure response is sent
    res.on('finish', () => {
      console.log('[Vercel] Response sent with status:', res.statusCode);
      resolve();
    });
  });
};
