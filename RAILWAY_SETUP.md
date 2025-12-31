# Railway Setup Guide

This guide helps you set up PostgreSQL, Redis, and configure environment variables for your Railway deployment.

## Prerequisites

- Railway CLI installed: `npm i -g @railway/cli` or `brew install railway`
- Logged into Railway: `railway login`
- Project linked: `railway link`

## Step 1: Add PostgreSQL and Redis Services

Railway CLI's `add` command requires interactive selection. Use one of these methods:

### Option 1: Railway Dashboard (Recommended)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project: `terrific-playfulness`
3. Click **"New"** → **"Database"** → **"PostgreSQL"**
4. Click **"New"** → **"Database"** → **"Redis"**

Railway will automatically:
- Link services to your server
- Provide `DATABASE_URL` and `REDIS_URL` environment variables

### Option 2: Railway CLI (Interactive)
```bash
railway add --database postgres
railway add --database redis
```

## Step 2: Verify Services are Added

Run the setup script to check:

```bash
./scripts/railway-setup.sh
```

Or manually check:
```bash
railway variables --kv | grep -E "(DATABASE_URL|REDIS_URL)"
```

## Step 3: Configure Environment Variables

### Using the Configuration Script

```bash
./scripts/railway-env-config.sh
```

### Manual Configuration

Set server configuration:
```bash
railway variables --set NODE_ENV=production
railway variables --set LOG_LEVEL=info
railway variables --set ENABLE_FILE_LOGGING=false
```

Set API keys (replace with your actual keys):
```bash
railway variables --set ALPHA_VANTAGE_KEY=your_alpha_vantage_key
railway variables --set POLYGON_KEY=your_polygon_key
railway variables --set FMP_KEY=your_fmp_key
railway variables --set NEWS_API_KEY=your_news_api_key
railway variables --set TWELVE_DATA_KEY=your_twelve_data_key
```

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically provided by Railway when you add the database services.

## Step 4: Run Database Migrations

### Using the Migration Script

```bash
./scripts/railway-migrate.sh
```

### Manual Migration

First, create an initial migration (if not exists):
```bash
railway run pnpm prisma migrate dev --name init
```

Then deploy migrations:
```bash
railway run pnpm prisma migrate deploy
```

Or use db push for development:
```bash
railway run pnpm prisma db push
```

## Step 5: Verify Deployment

Check server logs:
```bash
railway logs --tail
```

Check service status:
```bash
railway status
```

## Available Scripts

- `./scripts/railway-setup.sh` - Check current setup status
- `./scripts/railway-env-config.sh` - Configure environment variables
- `./scripts/railway-migrate.sh` - Run database migrations

## Troubleshooting

### DATABASE_URL not found
- Ensure PostgreSQL service is added to your Railway project
- Check service is linked to your server service
- Verify in Railway Dashboard → Variables

### Migration fails
- Check DATABASE_URL is correctly set
- Verify database service is running
- Check Prisma schema is valid: `pnpm prisma validate`

### Connection issues
- Verify services are in the same Railway project
- Check environment variables are set correctly
- Review Railway logs for connection errors

## Environment Variables Reference

### Required (Auto-provided by Railway)
- `DATABASE_URL` - PostgreSQL connection string (provided by PostgreSQL service)
- `REDIS_URL` - Redis connection string (provided by Redis service)

### Required (Manual configuration)
- `ALPHA_VANTAGE_KEY` - Alpha Vantage API key
- `POLYGON_KEY` - Polygon.io API key
- `FMP_KEY` - Financial Modeling Prep API key
- `NEWS_API_KEY` - NewsAPI key
- `TWELVE_DATA_KEY` - Twelve Data API key

### Optional (Server configuration)
- `NODE_ENV=production` - Runtime environment
- `LOG_LEVEL=info` - Logging level (debug, info, warn, error)
- `ENABLE_FILE_LOGGING=false` - Enable file logging (Railway captures stdout)
