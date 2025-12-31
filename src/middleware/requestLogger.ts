import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export default function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logContext = 'HTTP'
    const { method, originalUrl, ip } = req
    const { statusCode } = res

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip}`

    if (statusCode >= 500) {
      logger.error(logMessage, undefined, logContext)
    } else if (statusCode >= 400) {
      logger.warn(logMessage, undefined, logContext)
    } else {
      logger.info(logMessage, undefined, logContext)
    }
  })

  next()
}

