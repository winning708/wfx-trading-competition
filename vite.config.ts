import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Return promise to handle async operations
      return (async () => {
        try {
          // Lazy load server only in dev mode using dynamic import
          // Use a computed string to avoid Vite trying to resolve at config time
          const modulePath = [".", "server", "index.ts"].join("/");
          const serverModule = await import(modulePath);
          const createExpressApp = serverModule.createServer;

          if (createExpressApp && typeof createExpressApp === "function") {
            const app = createExpressApp();
            // Add Express app as middleware to Vite dev server
            server.middlewares.use(app);
          }
        } catch (error) {
          console.warn(
            "Failed to load Express server for dev mode. Running client-only:",
            error instanceof Error ? error.message : String(error)
          );
        }
      })();
    },
  };
}
