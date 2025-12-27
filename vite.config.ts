import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let expressApp: any = null;

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
        // Initialize Express app once
        if (!expressApp) {
          try {
            const { createServer } = await import("./server/index.ts");
            expressApp = createServer();
            console.log("[Vite] Express server middleware loaded");
          } catch (error) {
            console.error("[Vite] Failed to load Express server:", error);
          }
        }

        // Add Express middleware to handle all routes
        if (expressApp) {
          server.middlewares.use(expressApp);
        }
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
