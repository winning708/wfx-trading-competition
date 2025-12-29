#!/bin/sh
set -e

# Early output to ensure we see startup
echo "[start-server.sh] Starting server startup script"
echo "[start-server.sh] Current directory: $(pwd)"
echo "[start-server.sh] Node version: $(node --version)"
echo "[start-server.sh] Checking for tsx..."

if [ -f "./node_modules/.bin/tsx" ]; then
  echo "[start-server.sh] Found tsx at ./node_modules/.bin/tsx"
else
  echo "[start-server.sh] ERROR: tsx not found at ./node_modules/.bin/tsx"
  ls -la node_modules/.bin/ 2>/dev/null || echo "[start-server.sh] node_modules/.bin does not exist"
  exit 1
fi

echo "[start-server.sh] Starting server..."
exec ./node_modules/.bin/tsx server-prod.ts
