#!/bin/sh
# Startup script for WFX Trading Competition server

# Immediate startup signal - write directly to stdout before anything else
exec 1>&1
exec 2>&1

echo "====================================="
echo "[START-SCRIPT] Initializing startup"
echo "[START-SCRIPT] PID: $$"
echo "[START-SCRIPT] Current time: $(date)"
echo "====================================="

# Show environment
echo "[START-SCRIPT] Node version: $(node --version)"
echo "[START-SCRIPT] Current directory: $(pwd)"
echo "[START-SCRIPT] PWD env: $PWD"

# Check critical files
echo "[START-SCRIPT] Checking required files..."
test -f server-prod.ts && echo "[START-SCRIPT] ✓ server-prod.ts exists" || { echo "[START-SCRIPT] ✗ server-prod.ts MISSING"; exit 1; }
test -f package.json && echo "[START-SCRIPT] ✓ package.json exists" || { echo "[START-SCRIPT] ✗ package.json MISSING"; exit 1; }
test -d dist && echo "[START-SCRIPT] ✓ dist directory exists" || { echo "[START-SCRIPT] ✗ dist directory MISSING"; exit 1; }
test -d server && echo "[START-SCRIPT] ✓ server directory exists" || { echo "[START-SCRIPT] ✗ server directory MISSING"; exit 1; }

# Check tsx
echo "[START-SCRIPT] Checking for tsx..."
if [ -f "./node_modules/.bin/tsx" ]; then
  echo "[START-SCRIPT] ✓ Found tsx"
  ./node_modules/.bin/tsx --version 2>&1 || echo "[START-SCRIPT] Could not get tsx version"
else
  echo "[START-SCRIPT] ✗ tsx NOT FOUND at ./node_modules/.bin/tsx"
  echo "[START-SCRIPT] Listing node_modules/.bin/:"
  ls -la node_modules/.bin/ 2>/dev/null || echo "[START-SCRIPT] node_modules/.bin directory does not exist"
  echo "[START-SCRIPT] Listing node_modules (first 20):"
  ls node_modules/ | head -20
  exit 1
fi

# Set environment
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3000}"

echo "[START-SCRIPT] NODE_ENV: $NODE_ENV"
echo "[START-SCRIPT] PORT: $PORT"
echo ""
echo "====================================="
echo "[START-SCRIPT] Starting server..."
echo "====================================="
echo ""

# Execute tsx with proper error handling
exec ./node_modules/.bin/tsx server-prod.ts
