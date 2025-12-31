import { Router, Request, Response } from 'express'
import * as coingeckoService from '../services/coingecko'
import * as alphaVantageService from '../services/alphaVantage'
import { cacheConfigs } from '../middleware/cacheHeaders'

const router: Router = Router()

/**
 * GET /api/crypto/markets
 * Get cryptocurrency market data
 */
router.get('/markets', cacheConfigs.marketData, async (req: Request, res: Response) => {
  try {
    const vsCurrency = (req.query.vs_currency as string) || 'usd'
    const ids = req.query.ids ? (req.query.ids as string).split(',') : undefined
    const limit = parseInt(req.query.limit as string) || 100

    const data = await coingeckoService.getMarketData(vsCurrency, ids, limit)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching crypto markets:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crypto markets' })
  }
})

/**
 * GET /api/crypto/price/:ids
 * Get cryptocurrency price data
 */
router.get('/price/:ids', async (req: Request, res: Response) => {
  try {
    const ids = req.params.ids.split(',')
    const vsCurrencies = req.query.vs_currencies
      ? (req.query.vs_currencies as string).split(',')
      : 'usd'

    const data = await coingeckoService.getPriceData(ids, vsCurrencies)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching crypto price:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crypto price' })
  }
})

/**
 * GET /api/crypto/history/:id
 * Get cryptocurrency historical data
 */
router.get('/history/:id', cacheConfigs.historical, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const vsCurrency = (req.query.vs_currency as string) || 'usd'
    const days = req.query.days ? parseInt(req.query.days as string) : 30

    const data = await coingeckoService.getHistoricalData(id, vsCurrency, days)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching crypto history:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crypto history' })
  }
})

/**
 * GET /api/crypto/global
 * Get global cryptocurrency market statistics
 */
router.get('/global', async (_req: Request, res: Response) => {
  try {
    const data = await coingeckoService.getGlobalMarketData()
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching global crypto data:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch global crypto data' })
  }
})

/**
 * GET /api/crypto/intraday/:symbol
 * Get cryptocurrency intraday data (Alpha Vantage)
 */
router.get('/intraday/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const market = (req.query.market as string) || 'USD'
    const interval = (req.query.interval as any) || '5min'

    const data = await alphaVantageService.getCryptoIntraday(symbol, market, interval)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching crypto intraday:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crypto intraday data' })
  }
})

/**
 * GET /api/crypto/exchange-rate/:from/:to
 * Get cryptocurrency exchange rate (Alpha Vantage)
 */
router.get('/exchange-rate/:from/:to', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params
    const rate = await alphaVantageService.getCryptoExchangeRate(from, to)
    res.json(rate)
  } catch (error: any) {
    console.error('Error fetching crypto exchange rate:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crypto exchange rate' })
  }
})

export default router

