import { Router, Request, Response } from 'express'
import * as exchangeRateService from '../services/exchangeRate'
import * as alphaVantageService from '../services/alphaVantage'

const router: Router = Router()

/**
 * GET /api/fx/latest
 * Get latest exchange rates
 */
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const base = (req.query.base as string) || 'USD'
    const rates = await exchangeRateService.getLatestRates(base)
    res.json(rates)
  } catch (error: any) {
    console.error('Error fetching latest rates:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch latest rates' })
  }
})

/**
 * GET /api/fx/history/:base/:date
 * Get historical exchange rates
 */
router.get('/history/:base/:date', async (req: Request, res: Response) => {
  try {
    const { base, date } = req.params
    const rates = await exchangeRateService.getHistoricalRates(base, date)
    res.json(rates)
  } catch (error: any) {
    console.error('Error fetching historical rates:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch historical rates' })
  }
})

/**
 * GET /api/fx/convert
 * Convert currency amount
 */
router.get('/convert', async (req: Request, res: Response) => {
  try {
    const amount = parseFloat(req.query.amount as string)
    const from = req.query.from as string
    const to = req.query.to as string

    if (!amount || !from || !to) {
      res.status(400).json({ error: 'Missing required parameters: amount, from, to' })
      return
    }

    const conversion = await exchangeRateService.convertCurrency(amount, from, to)
    res.json(conversion)
  } catch (error: any) {
    console.error('Error converting currency:', error)
    res.status(500).json({ error: error.message || 'Failed to convert currency' })
  }
})

/**
 * GET /api/fx/exchange-rate/:from/:to
 * Get real-time exchange rate (Alpha Vantage)
 */
router.get('/exchange-rate/:from/:to', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params
    const rate = await alphaVantageService.getCryptoExchangeRate(from, to)
    res.json(rate)
  } catch (error: any) {
    console.error('Error fetching exchange rate:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch exchange rate' })
  }
})

export default router

