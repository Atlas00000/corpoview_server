#!/bin/bash

# Railway Redis Service Addition Helper Script
# Guides you through adding Redis and verifies configuration

set -e

echo "=== Railway Redis Service Setup ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check if Redis already exists
if railway variables --kv 2>/dev/null | grep -q "REDIS_URL"; then
    echo "✅ Redis service already added!"
    REDIS_URL=$(railway variables --kv 2>/dev/null | grep "^REDIS_URL=" | cut -d'=' -f2-)
    echo "   Redis URL: ${REDIS_URL:0:50}..."
    echo ""
    echo "Redis is configured and ready to use!"
    exit 0
fi

echo "📋 Redis service not found. Let's add it!"
echo ""
echo "Since Railway CLI requires interactive input, please:"
echo ""
echo "OPTION 1: Railway Dashboard (Easiest)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open: https://railway.app/project/4da69f79-d1b9-496d-8a4c-c54977f39280"
echo "2. Click 'New' button (top right)"
echo "3. Select 'Database'"
echo "4. Select 'Redis'"
echo "5. Railway will automatically:"
echo "   • Create Redis service"
echo "   • Link it to your server service"
echo "   • Provide REDIS_URL environment variable"
echo ""
echo "OPTION 2: Railway CLI (Interactive)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Run: railway add --database redis"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After adding Redis service, run this script again to verify:"
echo "  ./scripts/railway-add-redis.sh"
echo ""
echo "Or run the setup script:"
echo "  ./scripts/railway-setup.sh"

