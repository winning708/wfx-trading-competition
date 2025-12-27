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
        try {
          // Import and setup Express after Vite is initialized
          // Using dynamic import with absolute path resolution
          const serverModule = await import(new URL("./server/index.ts", import.meta.url).href);
          const app = serverModule.createServer();

          // Use the Express app as middleware for all requests
          return () => {
            server.middlewares.use(app);
          };
        } catch (error) {
          console.error("[Vite] Failed to load Express server:", error);
          // Continue without server middleware if import fails
          return undefined;
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
