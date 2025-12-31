#!/bin/bash

# Railway Environment Variables Configuration Script
# Sets up all required environment variables for the CorpoView server

set -e

echo "=== Railway Environment Variables Setup ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Function to set variable if not already set
set_var_if_missing() {
    local key=$1
    local value=$2
    local description=$3
    
    if railway variables --kv 2>/dev/null | grep -q "^${key}="; then
        echo "✓ ${key} already set"
    else
        echo "Setting ${key}..."
        railway variables --set "${key}=${value}" --skip-deploys
        echo "✓ ${key} set to ${value}"
    fi
    if [ -n "$description" ]; then
        echo "  → ${description}"
    fi
    echo ""
}

# Server configuration
echo "📋 Configuring Server Variables..."
set_var_if_missing "NODE_ENV" "production" "Runtime environment"
set_var_if_missing "LOG_LEVEL" "info" "Logging level"
set_var_if_missing "ENABLE_FILE_LOGGING" "false" "File logging (Railway captures stdout)"

# Note: DATABASE_URL and REDIS_URL are automatically provided by Railway
# when you add PostgreSQL and Redis services
# These are required for the application to function properly:
# - DATABASE_URL: PostgreSQL connection (for Prisma/ORM)
# - REDIS_URL: Redis connection (for API response caching)

echo "📋 API Keys Configuration"
echo "⚠️  You need to set these manually with your actual API keys:"
echo ""
echo "railway variables --set ALPHA_VANTAGE_KEY=your_key"
echo "railway variables --set POLYGON_KEY=your_key"
echo "railway variables --set FMP_KEY=your_key"
echo "railway variables --set NEWS_API_KEY=your_key"
echo "railway variables --set TWELVE_DATA_KEY=your_key"
echo ""

echo "=== Configuration Complete ==="
echo ""
echo "Next steps:"
echo "1. Add PostgreSQL and Redis services if not already added"
echo "2. Set your API keys using the commands above"
echo "3. Run migrations: pnpm prisma migrate deploy"

