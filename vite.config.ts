import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    middlewareMode: false,
  },
  plugins: [
    react(),
    // Add Express server middleware for development only
    {
      name: "express-middleware",
      apply: "serve",
      async configureServer(server) {
        // Return middleware function that handles API requests
        return () => {
          server.middlewares.use(async (req, res, next) => {
            // Let Express handle API routes
            if (req.url.startsWith("/api/")) {
              try {
                const { createServer } = await import("./server/index.ts");
                const app = createServer();
                app(req, res, next);
              } catch (error) {
                console.error("[Vite] Express app error:", error);
                res.statusCode = 500;
                res.end("Internal server error");
              }
            } else {
              next();
            }
          });
        };
      },
    },
  ],
  build: {
    outDir: "dist/spa",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
