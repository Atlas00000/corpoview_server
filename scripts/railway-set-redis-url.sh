#!/bin/bash

# Railway Redis URL Configuration Script
# Sets REDIS_URL if Redis variables are available but REDIS_URL is not set

set -e

echo "=== Railway Redis URL Configuration ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check if REDIS_URL already exists
if railway variables --kv 2>/dev/null | grep -q "^REDIS_URL="; then
    REDIS_URL=$(railway variables --kv 2>/dev/null | grep "^REDIS_URL=" | cut -d'=' -f2-)
    echo "✅ REDIS_URL is already configured"
    echo "   REDIS_URL: ${REDIS_URL:0:60}..."
    echo ""
    echo "Redis is properly configured!"
    exit 0
fi

echo "⚠️  REDIS_URL not found in server service variables"
echo ""
echo "Railway should automatically provide REDIS_URL when Redis service is added."
echo ""
echo "Possible solutions:"
echo "1. Check Railway Dashboard → Redis Service → Variables"
echo "2. Ensure Redis service is in the same project and environment"
echo "3. Railway may need a moment to link services"
echo ""
echo "If REDIS_URL is available in Redis service variables, you can manually copy it:"
echo "  railway variables --set REDIS_URL=redis://user:password@host:port"
echo ""
echo "Or Railway Dashboard → Server Service → Variables → Add REDIS_URL from Redis service"

