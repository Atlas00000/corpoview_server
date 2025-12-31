# 🖥️ CorpoView Server

<div align="center">

**Express.js API Server for CorpoView Dashboard**

*High-performance backend with real-time market data integration, caching, and comprehensive API endpoints*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-red?style=for-the-badge&logo=redis)](https://redis.io/)

[API Documentation](#-api-endpoints) • [Setup](#-setup) • [Development](#-development) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [API Endpoints](#-api-endpoints)
- [Setup](#-setup)
- [Development](#-development)
- [Database](#-database)
- [Caching](#-caching)
- [Testing](#-testing)
- [Logging](#-logging)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)

---

## 🎯 Overview

The CorpoView Server is a robust Express.js API that powers the CorpoView dashboard. It provides RESTful endpoints for market data, handles caching with Redis, manages database operations with Prisma, and integrates with 7 external financial data APIs.

### Key Capabilities

- 📡 **RESTful API** - Comprehensive endpoints for stocks, crypto, FX, and news
- ⚡ **Redis Caching** - High-performance response caching
- 🗄️ **PostgreSQL Database** - Persistent data storage with Prisma ORM
- 🔄 **API Integration** - Seamless integration with 7 external data providers
- 📊 **Request Logging** - Structured logging with performance metrics
- 🛡️ **Error Handling** - Comprehensive error tracking and reporting
- 🔒 **Security** - CORS, rate limiting, input validation

---

## ✨ Features

### Core Features

- **Stock Market API**
  - Real-time quotes and intraday data
  - Historical daily data
  - Company profiles and overviews
  - Financial statements (income, balance sheet, cash flow)
  - Earnings calendar

- **Cryptocurrency API**
  - Market data and prices
  - Historical price data
  - Global cryptocurrency statistics
  - Exchange rates

- **Foreign Exchange API**
  - Latest exchange rates
  - Historical exchange rates
  - Currency conversion

- **News API**
  - Financial news headlines
  - Business news
  - Stock-specific news
  - News search

### Technical Features

- **Caching Strategy**
  - Redis-based response caching
  - Configurable TTL per endpoint
  - Cache invalidation support
  - HTTP cache headers

- **Database Management**
  - Prisma ORM with TypeScript
  - Database migrations
  - Connection pooling
  - Query optimization

- **Logging & Monitoring**
  - Structured JSON logging
  - Request/response logging
  - Error tracking
  - Performance metrics

- **Error Handling**
  - Centralized error handling
  - Error reporting endpoint
  - Graceful degradation
  - Error context tracking

---

## 🛠 Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express** | Web framework | 4.18+ |
| **TypeScript** | Type-safe JavaScript | 5.3+ |
| **Prisma** | ORM and database toolkit | 5.7+ |
| **PostgreSQL** | Primary database | 15+ |
| **Redis** | Caching layer | 7+ |
| **ioredis** | Redis client | 5.3+ |
| **Axios** | HTTP client | 1.6+ |
| **CORS** | Cross-origin resource sharing | 2.8+ |
| **Dotenv** | Environment variables | 16.3+ |

---

## 🔌 API Endpoints

### Base URL

```
Development: http://localhost:5000
Production: https://your-server.railway.app
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T00:00:00.000Z"
}
```

### Stock Endpoints

#### Get Stock Quote
```http
GET /api/stocks/quote/:symbol
```

**Parameters:**
- `symbol` (path) - Stock ticker symbol (e.g., AAPL, TSLA)

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 175.50,
  "change": 2.30,
  "changePercent": 1.33,
  "volume": 45234567,
  "high": 176.20,
  "low": 174.10,
  "open": 174.50,
  "previousClose": 173.20
}
```

#### Get Intraday Data
```http
GET /api/stocks/intraday/:symbol?interval=60min
```

**Parameters:**
- `symbol` (path) - Stock ticker symbol
- `interval` (query) - Data interval (1min, 5min, 15min, 30min, 60min)

#### Get Daily Data
```http
GET /api/stocks/daily/:symbol?outputsize=compact
```

**Parameters:**
- `symbol` (path) - Stock ticker symbol
- `outputsize` (query) - compact (100 data points) or full

#### Get Company Overview
```http
GET /api/stocks/overview/:symbol
```

#### Get Company Profile
```http
GET /api/stocks/profile/:symbol
```

#### Get Financial Statements
```http
GET /api/stocks/financials/:symbol
```

#### Get Earnings Calendar
```http
GET /api/stocks/earnings-calendar
```

### Cryptocurrency Endpoints

#### Get Crypto Markets
```http
GET /api/crypto/markets?vs_currency=usd&limit=50&ids=bitcoin,ethereum
```

**Parameters:**
- `vs_currency` (query) - Target currency (default: usd)
- `limit` (query) - Number of results
- `ids` (query) - Comma-separated crypto IDs

#### Get Crypto Price
```http
GET /api/crypto/price/:ids
```

#### Get Crypto History
```http
GET /api/crypto/history/:id?vs_currency=usd&days=7
```

#### Get Global Crypto Stats
```http
GET /api/crypto/global
```

### Foreign Exchange Endpoints

#### Get Latest Rates
```http
GET /api/fx/latest?base=USD
```

#### Get Historical Rates
```http
GET /api/fx/history/:base/:date
```

#### Convert Currency
```http
GET /api/fx/convert?from=USD&to=EUR&amount=100
```

#### Get Exchange Rate
```http
GET /api/fx/exchange-rate/:from/:to
```

### News Endpoints

#### Get Headlines
```http
GET /api/news/headlines?category=business&country=us
```

#### Search News
```http
GET /api/news/search?q=stocks&language=en
```

#### Get Business News
```http
GET /api/news/business
```

### Error Reporting

#### Report Client Error
```http
POST /api/errors
```

**Request Body:**
```json
{
  "message": "Error message",
  "stack": "Error stack trace",
  "context": {},
  "level": "error"
}
```

---

## ⚙️ Setup

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services** (PostgreSQL and Redis)
   ```bash
   docker-compose up -d
   ```

5. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

The server will start on `http://localhost:5000`

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Building
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm type-check       # Type check without emitting
```

### Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── index.ts               # Server entry point
│   ├── routes/                # API route handlers
│   │   ├── stocks.ts          # Stock endpoints
│   │   ├── crypto.ts          # Crypto endpoints
│   │   ├── fx.ts              # FX endpoints
│   │   ├── news.ts            # News endpoints
│   │   └── errors.ts          # Error reporting
│   ├── services/              # External API services
│   │   ├── alphaVantage.ts    # Alpha Vantage API
│   │   ├── polygon.ts         # Polygon.io API
│   │   ├── coingecko.ts       # CoinGecko API
│   │   ├── financialModelingPrep.ts  # FMP API
│   │   ├── exchangeRate.ts    # ExchangeRate API
│   │   └── newsAPI.ts         # NewsAPI
│   ├── middleware/            # Express middleware
│   │   ├── cors.ts            # CORS configuration
│   │   ├── cache.ts           # Redis caching middleware
│   │   ├── cacheHeaders.ts    # HTTP cache headers
│   │   └── requestLogger.ts   # Request logging
│   ├── config/                # Configuration
│   │   ├── api.ts             # API configurations
│   │   ├── database.ts        # Prisma client
│   │   └── redis.ts           # Redis client
│   └── utils/                 # Utilities
│       └── logger.ts          # Logging utility
├── prisma/
│   └── schema.prisma          # Prisma schema
├── logs/                      # Application logs
└── dist/                      # Compiled JavaScript
```

---

## 🗄️ Database

### Prisma Schema

The application uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

**Example Model:**
```prisma
model Favorite {
  id        String   @id @default(cuid())
  symbol    String
  assetType String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([symbol, assetType])
}
```

### Database Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Connection

The database connection is configured via `DATABASE_URL` environment variable:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## ⚡ Caching

### Redis Caching

The server uses Redis for response caching to reduce API calls and improve performance.

**Cache Configuration:**
- Real-time data: 30 seconds TTL
- Market data: 60 seconds TTL
- Corporate data: 5 minutes TTL
- News: 3 minutes TTL
- Historical data: 1 hour TTL

**Cache Headers:**

The server sets HTTP cache headers for client-side caching:

```
Cache-Control: public, max-age=60, stale-while-revalidate=120
```

### Cache Usage

Caching is automatically applied via middleware. Services check Redis before making external API calls.

---

## 🧪 Testing

### Testing Strategy

The server follows industry best practices for testing:

#### **Unit Tests**
- **Framework**: Vitest
- **Coverage**: Services, utilities, middleware
- **Location**: `src/**/*.test.ts`

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

#### **Integration Tests**
- **Framework**: Vitest + Supertest
- **Coverage**: API endpoints, database operations
- **Location**: `tests/integration/*.test.ts`

```bash
pnpm test:integration  # Run integration tests
```

### Test Structure

```typescript
// Example unit test
import { describe, it, expect } from 'vitest'
import { getStockQuote } from '../services/alphaVantage'

describe('Alpha Vantage Service', () => {
  it('should fetch stock quote', async () => {
    const quote = await getStockQuote('AAPL')
    expect(quote).toHaveProperty('symbol')
    expect(quote.symbol).toBe('AAPL')
  })
})
```

```typescript
// Example integration test
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app'

describe('Stock API', () => {
  it('GET /api/stocks/quote/:symbol', async () => {
    const res = await request(app)
      .get('/api/stocks/quote/AAPL')
      .expect(200)
    
    expect(res.body).toHaveProperty('symbol')
    expect(res.body.symbol).toBe('AAPL')
  })
})
```

### Testing Best Practices

✅ **Isolation**
- Each test is independent
- Mock external API calls
- Use test database for integration tests

✅ **Coverage Goals**
- Unit tests: >80% coverage
- Integration tests: All API endpoints
- Critical paths: 100% coverage

✅ **Test Data**
- Use factories for test data
- Clean up after tests
- Avoid hardcoded values

---

## 📝 Logging

### Logging System

The server uses structured logging with JSON format for production and human-readable format for development.

**Log Levels:**
- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages

**Log Configuration:**
```env
LOG_LEVEL=info                    # Log level
ENABLE_FILE_LOGGING=true          # Enable file logging
LOG_DIR=./logs                    # Log directory
```

### Request Logging

All HTTP requests are logged with:
- Method and URL
- Status code
- Response time
- IP address

**Example Log:**
```
INFO 2025-12-31T00:00:00.000Z [HTTP] GET /api/stocks/quote/AAPL 200 - 45ms - ::1
```

### Error Logging

Errors are logged with:
- Error message and stack trace
- Request context
- User information (if available)
- Error level

---

## 🛡️ Error Handling

### Error Handling Strategy

1. **Try-Catch Blocks** - Wrap async operations
2. **Error Middleware** - Centralized error handling
3. **Error Tracking** - Log and report errors
4. **Graceful Degradation** - Return partial data when possible

### Error Response Format

```json
{
  "error": "Error message",
  "statusCode": 500,
  "timestamp": "2025-12-31T00:00:00.000Z"
}
```

### Error Reporting

Client-side errors can be reported to `/api/errors` endpoint for tracking and monitoring.

---

## 🚢 Deployment

### Deployment to Railways

1. **Connect Repository**
   - Link GitHub repository to Railways
   - Set root directory to `server`

2. **Configure Environment Variables**
   - Set all required environment variables
   - Configure database and Redis URLs

3. **Set Build and Start Commands**
   - Build: `pnpm install && pnpm build`
   - Start: `pnpm start`

4. **Deploy**
   - Railways will automatically build and deploy

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

### Docker Deployment

```bash
# Build image
docker build -t corpoview-server .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  corpoview-server
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://host:port

# API Keys
ALPHA_VANTAGE_KEY=your_key_here
POLYGON_KEY=your_key_here
FMP_KEY=your_key_here
NEWS_API_KEY=your_key_here
TWELVE_DATA_KEY=your_key_here

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
LOG_DIR=./logs
```

### Optional Variables

```env
# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

See `.env.example` for complete list.

---

## 📚 Additional Resources

- [API Documentation](../docs/api.md) - Detailed API documentation
- [Deployment Guide](../DEPLOYMENT.md) - Deployment instructions
- [API Setup Guide](../API_SETUP.md) - API key configuration
- [Client README](../client/README.md) - Frontend documentation

---

<div align="center">

**Built with ❤️ for the CorpoView Dashboard**

[Back to Main README](../README.md) • [Client Documentation](../client/README.md)

</div>

