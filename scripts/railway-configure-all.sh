#!/bin/bash

# Complete Railway Configuration Script
# Checks Redis, shows API key status, and provides configuration commands

set -e

echo "=== Railway Complete Configuration Check ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check Redis
echo "📦 Redis Service:"
if railway variables --kv 2>/dev/null | grep -q "REDIS_URL"; then
    REDIS_URL=$(railway variables --kv 2>/dev/null | grep "^REDIS_URL=" | cut -d'=' -f2-)
    echo "✅ Redis is properly linked!"
    echo "   REDIS_URL: ${REDIS_URL:0:50}..."
else
    echo "⚠️  REDIS_URL not found"
    echo "   Redis may need to be linked to the server service"
    echo "   Check Railway Dashboard → Project → Redis Service"
    echo "   Ensure Redis is in the same project and environment"
fi
echo ""

# Check API Keys
echo "🔑 API Keys Status:"
KEYS_CONFIGURED=0
TOTAL_KEYS=5

check_and_report() {
    local key=$1
    local name=$2
    
    if railway variables --kv 2>/dev/null | grep -q "^${key}="; then
        local value=$(railway variables --kv 2>/dev/null | grep "^${key}=" | cut -d'=' -f2-)
        if [ "${#value}" -gt 10 ]; then
            echo "✅ ${name}"
            ((KEYS_CONFIGURED++))
        else
            echo "⚠️  ${name} (seems incomplete)"
        fi
    else
        echo "❌ ${name}"
    fi
}

check_and_report "ALPHA_VANTAGE_KEY" "Alpha Vantage"
check_and_report "POLYGON_KEY" "Polygon.io"
check_and_report "FMP_KEY" "Financial Modeling Prep"
check_and_report "NEWS_API_KEY" "NewsAPI"
check_and_report "TWELVE_DATA_KEY" "Twelve Data"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Configuration Summary: ${KEYS_CONFIGURED}/${TOTAL_KEYS} API keys configured"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $KEYS_CONFIGURED -lt $TOTAL_KEYS ]; then
    echo "To configure API keys, run:"
    echo ""
    echo "railway variables --set ALPHA_VANTAGE_KEY=your_actual_key"
    echo "railway variables --set POLYGON_KEY=your_actual_key"
    echo "railway variables --set FMP_KEY=your_actual_key"
    echo "railway variables --set NEWS_API_KEY=your_actual_key"
    echo "railway variables --set TWELVE_DATA_KEY=your_actual_key"
    echo ""
    echo "Railway will automatically redeploy after setting variables."
else
    echo "✅ All API keys are configured!"
    echo ""
    echo "Check server logs to verify:"
    echo "  railway logs --tail"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

