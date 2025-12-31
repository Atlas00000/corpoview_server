#!/bin/bash

# Railway Migration Script
# Runs Prisma migrations on Railway

set -e

echo "=== Railway Database Migration ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check if DATABASE_URL exists
if ! railway variables --kv 2>/dev/null | grep -q "DATABASE_URL"; then
    echo "❌ DATABASE_URL not found"
    echo "   Please add PostgreSQL service first"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm prisma generate

# Run migrations
echo ""
echo "🚀 Running database migrations..."
railway run pnpm prisma migrate deploy

echo ""
echo "✅ Migrations completed successfully!"

