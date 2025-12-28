# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY .npmrc package.json pnpm-lock.yaml ./

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build frontend only
RUN pnpm run build


# Final production image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY .npmrc package.json pnpm-lock.yaml ./

# Install ONLY production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy the simple production server
COPY server-prod.js .

# Expose port 3000
EXPOSE 3000

# Start the simple JavaScript server
CMD [ "node", "server-prod.js" ]
