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
    // Add Express server middleware for development
    {
      name: "express-middleware",
      apply: "serve",
      configResolved(resolvedConfig) {
        // Store the resolved config for later use
      },
      async configureServer(server) {
        // Import and setup Express after Vite is initialized
        const { createServer } = await import("./server/index");
        const app = createServer();

        // Return middleware to handle API routes before Vite's own handling
        return () => {
          server.middlewares.use((req, res, next) => {
            // Only handle API routes with Express
            if (req.url?.startsWith("/api/")) {
              app(req, res, next);
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
