#!/bin/bash

echo "🧹 Cleaning build caches..."

# Next.js Cache
if [ -d ".next/cache" ]; then
  rm -rf .next/cache
fi

# Turbopack Cache
if [ -d ".turbo" ]; then
  rm -rf .turbo
fi

# TypeScript Build Info
if [ -f "tsconfig.tsbuildinfo" ]; then
  rm -f tsconfig.tsbuildinfo
fi

echo "✅ Cache cleanup complete!"

