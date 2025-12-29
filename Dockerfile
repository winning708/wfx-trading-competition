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

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies
RUN pnpm install --prod

# Copy built frontend and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Copy production server entry point and config files
COPY server-prod.ts .
COPY tsconfig.json .
COPY tsconfig.server.json .

# Expose port 3000
EXPOSE 3000

# Start server with tsx
CMD [ "npx", "tsx", "server-prod.ts" ]
