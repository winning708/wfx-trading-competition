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
        // Dynamically import server with proper error handling
        try {
          // Import using require in CJS mode or dynamic import
          const { createServer } = await import("./server/index.ts");
          const app = createServer();

          // Use the Express app as middleware for all requests
          return () => {
            server.middlewares.use(app);
          };
        } catch (error) {
          console.warn(
            "[Vite] Express server middleware disabled:",
            (error as Error).message,
          );
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
