#!/bin/bash

# Railway API Keys Configuration Script
# Sets all required API keys for the CorpoView server

set -e

echo "=== Railway API Keys Configuration ==="
echo ""

# Check if Railway CLI is installed and linked
if ! railway status &> /dev/null; then
    echo "❌ Not linked to Railway project. Run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"
echo ""

# Check if API keys are already set
echo "📋 Checking current API keys status..."
echo ""

check_api_key() {
    local key=$1
    local name=$2
    
    if railway variables --kv 2>/dev/null | grep -q "^${key}="; then
        local value=$(railway variables --kv 2>/dev/null | grep "^${key}=" | cut -d'=' -f2-)
        if [ "${#value}" -gt 10 ]; then
            echo "✅ ${name} is configured (${#value} characters)"
        else
            echo "⚠️  ${name} is set but seems incomplete"
        fi
    else
        echo "❌ ${name} not configured"
    fi
}

check_api_key "ALPHA_VANTAGE_KEY" "Alpha Vantage API Key"
check_api_key "POLYGON_KEY" "Polygon.io API Key"
check_api_key "FMP_KEY" "Financial Modeling Prep API Key"
check_api_key "NEWS_API_KEY" "NewsAPI Key"
check_api_key "TWELVE_DATA_KEY" "Twelve Data API Key"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To set API keys, use:"
echo ""
echo "railway variables --set ALPHA_VANTAGE_KEY=your_alpha_vantage_key"
echo "railway variables --set POLYGON_KEY=your_polygon_key"
echo "railway variables --set FMP_KEY=your_fmp_key"
echo "railway variables --set NEWS_API_KEY=your_news_api_key"
echo "railway variables --set TWELVE_DATA_KEY=your_twelve_data_key"
echo ""
echo "Or set them all at once:"
echo "railway variables \\"
echo "  --set ALPHA_VANTAGE_KEY=your_key \\"
echo "  --set POLYGON_KEY=your_key \\"
echo "  --set FMP_KEY=your_key \\"
echo "  --set NEWS_API_KEY=your_key \\"
echo "  --set TWELVE_DATA_KEY=your_key"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After setting keys, Railway will automatically redeploy your service."
echo "Check logs with: railway logs --tail"

