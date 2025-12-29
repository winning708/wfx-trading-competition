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


# Final production image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm and curl for debugging
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies (includes tsx)
RUN pnpm install --prod

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
RUN chmod +x /app/start-server.sh

# Expose port 3000
EXPOSE 3000

# Start server with startup script
CMD [ "/app/start-server.sh" ]
