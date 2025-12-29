# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy all files first
COPY . .

# Install all dependencies
RUN pnpm install

# Build frontend
RUN pnpm run build

# Verify build output
RUN test -d dist/spa || (echo "[BUILD] ERROR: dist/spa directory not found after build" && exit 1)
RUN test -f dist/spa/index.html || (echo "[BUILD] ERROR: dist/spa/index.html not found" && exit 1)
RUN echo "[BUILD] Frontend build successful, files:" && ls -la dist/spa/ | head -20


# Final production image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm and curl for debugging/health checks
RUN npm install -g pnpm@10.14.0 && apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies (includes tsx)
RUN pnpm install --prod && echo "[DOCKER] Production dependencies installed"

# Copy built frontend and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Copy server config and entry files
COPY server-prod.ts .
COPY tsconfig.json .
COPY tsconfig.server.json .
COPY start-server.sh .

# Make startup script executable
RUN chmod +x /app/start-server.sh && echo "[DOCKER] Startup script made executable"

# Verify critical files exist
RUN test -f server-prod.ts && echo "[DOCKER] ✓ server-prod.ts found" || (echo "[DOCKER] ✗ server-prod.ts missing" && exit 1)
RUN test -f ./node_modules/.bin/tsx && echo "[DOCKER] ✓ tsx found" || (echo "[DOCKER] ✗ tsx not found" && exit 1)
RUN test -d dist/spa && echo "[DOCKER] ✓ dist/spa found" || (echo "[DOCKER] ✗ dist/spa missing" && exit 1)

# Expose port 3000
EXPOSE 3000

# Health check - verify server is responding
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/ping || exit 1

# Start server with startup script
CMD [ "/app/start-server.sh" ]
