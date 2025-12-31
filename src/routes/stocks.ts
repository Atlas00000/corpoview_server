import { Router, Request, Response } from 'express'
import * as alphaVantageService from '../services/alphaVantage'
import * as polygonService from '../services/polygon'
import * as fmpService from '../services/financialModelingPrep'
import { cacheConfigs } from '../middleware/cacheHeaders'
import { formatErrorResponse } from '../utils/errors'

const router: Router = Router()

/**
 * GET /api/stocks/quote/:symbol
 * Get real-time stock quote
 */
router.get('/quote/:symbol', cacheConfigs.realtime, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const quote = await alphaVantageService.getStockQuote(symbol)
    res.json(quote)
  } catch (error: any) {
    console.error('Error fetching stock quote:', error)
    const errorResponse = formatErrorResponse(error, 'Alpha Vantage')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/stocks/intraday/:symbol
 * Get intraday time series data
 */
router.get('/intraday/:symbol', cacheConfigs.realtime, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const interval = (req.query.interval as any) || '5min'
    const data = await alphaVantageService.getIntradayData(symbol, interval)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching intraday data:', error)
    const errorResponse = formatErrorResponse(error, 'Alpha Vantage')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/stocks/daily/:symbol
 * Get daily time series data
 */
router.get('/daily/:symbol', cacheConfigs.marketData, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const outputsize = (req.query.outputsize as 'compact' | 'full') || 'compact'
    const data = await alphaVantageService.getDailyData(symbol, outputsize)
    res.json(data)
  } catch (error: any) {
    console.error('Error fetching daily data:', error)
    const errorResponse = formatErrorResponse(error, 'Alpha Vantage')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/stocks/overview/:symbol
 * Get company overview
 */
router.get('/overview/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const overview = await alphaVantageService.getCompanyOverview(symbol)
    res.json(overview)
  } catch (error: any) {
    console.error('Error fetching company overview:', error)
    const errorResponse = formatErrorResponse(error, 'Alpha Vantage')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/stocks/profile/:symbol
 * Get company profile from FMP
 */
router.get('/profile/:symbol', cacheConfigs.corporateData, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const profile = await fmpService.getCompanyProfile(symbol)
    res.json(profile)
  } catch (error: any) {
    console.error('Error fetching company profile:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch company profile' })
  }
})

/**
 * GET /api/stocks/financials/:symbol
 * Get financial statements
 */
router.get('/financials/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const limit = parseInt(req.query.limit as string) || 5

    const [income, balanceSheet, cashFlow] = await Promise.all([
      fmpService.getIncomeStatement(symbol, limit),
      fmpService.getBalanceSheet(symbol, limit),
      fmpService.getCashFlowStatement(symbol, limit),
    ])

    res.json({
      incomeStatement: income,
      balanceSheet: balanceSheet,
      cashFlowStatement: cashFlow,
    })
  } catch (error: any) {
    console.error('Error fetching financial statements:', error)
    const errorResponse = formatErrorResponse(error, 'Financial Modeling Prep')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/stocks/news/:symbol
 * Get news for a stock
 */
router.get('/news/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    const news = await polygonService.getTickerNews(symbol, limit)
    res.json(news)
  } catch (error: any) {
    console.error('Error fetching stock news:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch stock news' })
  }
})

/**
 * GET /api/stocks/earnings-calendar
 * Get earnings calendar
 */
router.get('/earnings-calendar', async (req: Request, res: Response) => {
  try {
    const from = (req.query.from as string) || new Date().toISOString().split('T')[0]
    const to = (req.query.to as string) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const calendar = await fmpService.getEarningsCalendar(from, to)
    res.json(calendar)
  } catch (error: any) {
    console.error('Error fetching earnings calendar:', error)
    const errorResponse = formatErrorResponse(error, 'Financial Modeling Prep')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

export default router

