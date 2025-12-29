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

# Compile server TypeScript files to JavaScript
RUN pnpm exec tsc -p tsconfig.server.json --outDir dist-server


# Final production image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies (remove tsx and typescript since we compile)
RUN pnpm install --prod && npm remove tsx typescript --save 2>/dev/null || true

# Copy built frontend and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Copy config files (for reference only, not needed at runtime)
COPY tsconfig.json .
COPY tsconfig.server.json .

# Copy the startup script
COPY start-server.sh .
RUN chmod +x start-server.sh

# Create a simple JavaScript entry point since we compiled everything
COPY server-prod.ts .

# Expose port 3000
EXPOSE 3000

# Start server directly with Node
CMD [ "node", "dist-server/server-prod.js" ]
