#!/bin/bash

# Railway Setup Script
# This script helps configure Railway services and environment variables

set -e

echo "=== Railway Setup Script ==="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "Install it from: https://docs.railway.app/develop/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if linked to a project
if ! railway status &> /dev/null; then
    echo "⚠️  Not linked to a Railway project"
    echo "Run: railway link"
    exit 1
fi

echo "✅ Linked to Railway project"
echo ""

# Show current variables
echo "📋 Current Environment Variables:"
railway variables --kv
echo ""

# Check if DATABASE_URL exists (indicates PostgreSQL is added)
if railway variables --kv 2>/dev/null | grep -q "DATABASE_URL"; then
    echo "✅ PostgreSQL detected (DATABASE_URL found)"
else
    echo "⚠️  PostgreSQL not found"
    echo "   Add PostgreSQL via Railway Dashboard or run: railway add --database postgres"
fi

# Check if REDIS_URL exists (indicates Redis is added)
if railway variables --kv 2>/dev/null | grep -q "REDIS_URL"; then
    echo "✅ Redis detected (REDIS_URL found)"
    REDIS_URL=$(railway variables --kv 2>/dev/null | grep "^REDIS_URL=" | cut -d'=' -f2-)
    echo "   Redis URL: ${REDIS_URL:0:30}..." # Show first 30 chars
else
    echo "⚠️  Redis not found"
    echo "   Add Redis via Railway Dashboard or run: railway add --database redis"
    echo "   Redis is required for caching API responses"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Add missing services via Railway Dashboard or CLI"
echo "2. Configure API keys using: railway variables --set KEY=value"
echo "3. Run migrations using: pnpm prisma migrate deploy"

