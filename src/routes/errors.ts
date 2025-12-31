import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger'

const router: Router = Router()

/**
 * POST /api/errors
 * Receive client-side error reports
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const errorInfo = req.body

    // Log error to server logs
    logger.error('Client error reported', {
      message: errorInfo.message,
      stack: errorInfo.stack,
      context: errorInfo.context,
      level: errorInfo.level,
      tags: errorInfo.tags,
      breadcrumbs: errorInfo.breadcrumbs,
    }, 'ErrorTracking')

    // Here you could forward to external error tracking service
    // e.g., Sentry, LogRocket, etc.
    // await forwardToErrorService(errorInfo)

    res.status(200).json({ success: true })
  } catch (error: any) {
    logger.error('Error handling error report', error, 'ErrorTracking')
    res.status(500).json({ error: 'Failed to process error report' })
  }
})

export default router

