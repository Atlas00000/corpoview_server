export const API_CONFIG = {
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.ALPHA_VANTAGE_KEY,
    rateLimit: { calls: 5, per: 'minute' },
  },
  polygon: {
    baseUrl: 'https://api.polygon.io',
    apiKey: process.env.POLYGON_KEY,
    rateLimit: { calls: 5, per: 'minute' },
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    rateLimit: { calls: 50, per: 'minute' },
  },
  financialModelingPrep: {
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    apiKey: process.env.FMP_KEY,
    rateLimit: { calls: 250, per: 'day' },
  },
  exchangeRate: {
    baseUrl: 'https://api.exchangerate-api.com/v4',
    rateLimit: { calls: 1500, per: 'month' },
  },
  newsAPI: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.NEWS_API_KEY,
    rateLimit: { calls: 100, per: 'day' },
  },
  twelveData: {
    baseUrl: 'https://api.twelvedata.com',
    apiKey: process.env.TWELVE_DATA_KEY,
    rateLimit: { calls: 800, per: 'day' },
  },
} as const

