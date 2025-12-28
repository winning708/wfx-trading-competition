# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node"

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=latest
RUN npm install -g pnpm@$PNPM_VERSION


# Build stage
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

# Build client only
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base

# Copy built application and dependencies from build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Copy server source code (tsx will run it directly)
COPY --from=build /app/server /app/server

# Copy public folder if it exists and is needed at runtime
COPY --from=build /app/public /app/public

# Expose port 3000 (matching server configuration)
EXPOSE 3000

# Start the server using tsx to run TypeScript directly
CMD [ "npm", "start" ]
