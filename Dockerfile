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

# Compile server TypeScript to JavaScript
RUN npx tsc server-prod.ts --outDir . --module esnext --target esnext --moduleResolution node --esModuleInterop


# Final production image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies (this will now include tsx and typescript as deps, or remove them)
RUN pnpm install --prod

# Copy built frontend and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server-prod.js .

# Copy config files
COPY tsconfig.json .
COPY tsconfig.server.json .

# Expose port 3000
EXPOSE 3000

# Start with Node.js directly
CMD [ "node", "server-prod.js" ]
