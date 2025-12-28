# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY .npmrc package.json pnpm-lock.yaml ./

# Install dependencies (production only)
RUN pnpm install --frozen-lockfile --prod

# Copy application code
COPY . .

# Build frontend only
RUN pnpm run build

# Copy the simple production server
COPY server-prod.js .

# Expose port 3000
EXPOSE 3000

# Start the simple JavaScript server
CMD [ "node", "server-prod.js" ]
