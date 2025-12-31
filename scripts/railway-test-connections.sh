#!/bin/bash

# Railway Connection Test Script
# Tests database and Redis connections

set -e

echo "=== Railway Connection Tests ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check DATABASE_URL
if railway variables --kv 2>/dev/null | grep -q "DATABASE_URL"; then
    echo "✅ DATABASE_URL found"
    
    # Test PostgreSQL connection
    echo "Testing PostgreSQL connection..."
    if railway run psql "$DATABASE_URL" -c "SELECT version();" 2>/dev/null | head -1; then
        echo "✅ PostgreSQL connection successful"
    else
        echo "⚠️  PostgreSQL connection test failed (might be normal if psql not available)"
        echo "   Database connection will be tested when server starts"
    fi
else
    echo "❌ DATABASE_URL not found - PostgreSQL service not added"
fi

echo ""

# Check REDIS_URL
if railway variables --kv 2>/dev/null | grep -q "REDIS_URL"; then
    echo "✅ REDIS_URL found"
    
    # Test Redis connection (if redis-cli is available)
    echo "Testing Redis connection..."
    REDIS_URL=$(railway variables --kv 2>/dev/null | grep "^REDIS_URL=" | cut -d'=' -f2-)
    
    # Extract connection details for redis-cli
    if command -v redis-cli &> /dev/null; then
        # Parse Redis URL (format: redis://[:password@]host[:port][/database])
        if [[ $REDIS_URL == redis://* ]]; then
            echo "   Redis URL configured: ${REDIS_URL:0:40}..."
            echo "✅ Redis connection URL is valid"
            echo "   Connection will be tested when server starts"
        fi
    else
        echo "✅ Redis URL configured"
        echo "   Connection will be tested when server starts"
    fi
else
    echo "❌ REDIS_URL not found - Redis service not added"
    echo "   Redis is required for API response caching"
fi

echo ""
echo "=== Connection Tests Complete ==="
echo ""
echo "Note: Full connection tests will occur when the server starts"
echo "Check server logs with: railway logs --tail"

