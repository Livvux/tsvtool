#!/bin/bash

echo "🧹 Cleaning build caches..."

# Next.js Cache
if [ -d ".next" ]; then
  rm -rf .next
  echo "  ✓ Removed .next directory"
fi

# Turbopack Cache
if [ -d ".turbo" ]; then
  rm -rf .turbo
  echo "  ✓ Removed .turbo directory"
fi

# Node modules cache
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "  ✓ Removed node_modules/.cache"
fi

# TypeScript Build Info
if [ -f "tsconfig.tsbuildinfo" ]; then
  rm -f tsconfig.tsbuildinfo
  echo "  ✓ Removed tsconfig.tsbuildinfo"
fi

# Temp panic logs
if [ -d "/var/folders" ]; then
  find /var/folders -name "next-panic-*.log" -type f -mtime +1 -delete 2>/dev/null && echo "  ✓ Cleaned old panic logs" || true
fi

echo "✅ Cache cleanup complete!"

