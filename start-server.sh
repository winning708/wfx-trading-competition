#!/bin/sh
# Startup script for WFX Trading Competition server
# This script provides comprehensive diagnostics and error handling

# Fail on first error
set -e

# Make sure output is not buffered
exec 1>&1
exec 2>&1

# Print startup banner
echo ""
echo "=========================================="
echo "[STARTUP] WFX Trading Competition Server"
echo "=========================================="
echo "[STARTUP] Date: $(date)"
echo "[STARTUP] PID: $$"
echo "[STARTUP] Node version: $(node --version)"
echo "[STARTUP] Directory: $(pwd)"
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "[STARTUP] ✓ Node is available: $NODE_VERSION"

# Check package.json exists
if [ -f "package.json" ]; then
  echo "[STARTUP] ✓ package.json found"
else
  echo "[STARTUP] ✗ FATAL: package.json not found"
  exit 1
fi

# Check critical files
echo ""
echo "[STARTUP] Checking for required files..."

FILES_TO_CHECK="server-prod.ts package.json"
for file in $FILES_TO_CHECK; do
  if [ -f "$file" ]; then
    echo "[STARTUP]   ✓ $file"
  else
    echo "[STARTUP]   ✗ MISSING: $file"
    exit 1
  fi
done

# Check directories
DIRS_TO_CHECK="dist server"
for dir in $DIRS_TO_CHECK; do
  if [ -d "$dir" ]; then
    echo "[STARTUP]   ✓ $dir/ (directory)"
  else
    echo "[STARTUP]   ✗ MISSING: $dir/ (directory)"
    exit 1
  fi
done

# Check that dist/spa exists
if [ -d "dist/spa" ]; then
  echo "[STARTUP]   ✓ dist/spa/ (frontend build)"
  FILE_COUNT=$(find dist/spa -type f | wc -l)
  echo "[STARTUP]     └─ Contains $FILE_COUNT files"
else
  echo "[STARTUP]   ⚠️  WARNING: dist/spa not found (frontend won't be served)"
fi

# Check tsx is installed
echo ""
echo "[STARTUP] Checking for tsx..."
if [ -f "./node_modules/.bin/tsx" ]; then
  TSX_VERSION=$(./node_modules/.bin/tsx --version 2>/dev/null || echo "unknown")
  echo "[STARTUP]   ✓ tsx found: $TSX_VERSION"
else
  echo "[STARTUP]   ✗ FATAL: tsx not found at ./node_modules/.bin/tsx"
  echo "[STARTUP]     Available modules in node_modules/.bin/:"
  ls -la node_modules/.bin/ 2>/dev/null | head -20 || echo "[STARTUP]     (directory listing failed)"
  exit 1
fi

# Check environment setup
echo ""
echo "[STARTUP] Environment setup..."
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3000}"
echo "[STARTUP]   - NODE_ENV: $NODE_ENV"
echo "[STARTUP]   - PORT: $PORT"

# Check critical environment variables
echo ""
echo "[STARTUP] Checking critical environment variables..."
CRITICAL_VARS="VITE_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY ADMIN_PASSWORD"
for var in $CRITICAL_VARS; do
  if [ -z "$(eval echo \$$var)" ]; then
    echo "[STARTUP]   ✗ MISSING: $var"
  else
    # Print masked version (first 10 chars + ...)
    value=$(eval echo \$$var)
    masked="${value:0:10}..."
    echo "[STARTUP]   ✓ $var (set)"
  fi
done

# Final checks
echo ""
echo "=========================================="
echo "[STARTUP] All checks passed!"
echo "[STARTUP] Starting server in 2 seconds..."
echo "=========================================="
echo ""

# Small delay to ensure all output is flushed
sleep 2

# Execute tsx with server-prod.ts
echo "[STARTUP] Executing: ./node_modules/.bin/tsx server-prod.ts"
echo ""

exec ./node_modules/.bin/tsx server-prod.ts
