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

# Compile TypeScript server to JavaScript
RUN npx tsc --project tsconfig.server.json --outDir dist/server


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

# Copy built frontend and server
COPY --from=builder /app/dist ./dist

# Copy production server entry point
COPY server-prod.js .

# Expose port 3000
EXPOSE 3000

# Start server
CMD [ "node", "server-prod.js" ]
