import { Router, Request, Response } from 'express'
import * as newsService from '../services/newsAPI'
import { cacheConfigs } from '../middleware/cacheHeaders'
import { formatErrorResponse } from '../utils/errors'

const router: Router = Router()

/**
 * GET /api/news/headlines
 * Get top headlines
 */
router.get('/headlines', cacheConfigs.news, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined
    const country = (req.query.country as string) || 'us'
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const articles = await newsService.getTopHeadlines(category, country, pageSize)
    res.json(articles)
  } catch (error: any) {
    console.error('Error fetching headlines:', error)
    const errorResponse = formatErrorResponse(error, 'NewsAPI')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

/**
 * GET /api/news/search
 * Search news articles
 */
router.get('/search', cacheConfigs.news, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string

    if (!query) {
      res.status(400).json({ error: 'Missing required parameter: q (query)' })
      return
    }

    const language = (req.query.language as string) || 'en'
    const sortBy = (req.query.sortBy as string) || 'publishedAt'
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const articles = await newsService.searchNews(query, language, sortBy, pageSize)
    res.json(articles)
  } catch (error: any) {
    console.error('Error searching news:', error)
    res.status(500).json({ error: error.message || 'Failed to search news' })
  }
})

/**
 * GET /api/news/business
 * Get business news
 */
router.get('/business', async (req: Request, res: Response) => {
  try {
    const pageSize = parseInt(req.query.pageSize as string) || 20
    const articles = await newsService.getBusinessNews(pageSize)
    res.json(articles)
  } catch (error: any) {
    console.error('Error fetching business news:', error)
    const errorResponse = formatErrorResponse(error, 'NewsAPI')
    res.status(errorResponse.statusCode).json(errorResponse.body)
  }
})

export default router

