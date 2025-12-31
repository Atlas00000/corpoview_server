import express, { Request, Response, NextFunction } from 'express'
import corsMiddleware from './middleware/cors'
import requestLogger from './middleware/requestLogger'
import { logger } from './utils/logger'
import dotenv from 'dotenv'

dotenv.config()

const app: express.Application = express()

// Middleware
app.use(corsMiddleware)
app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
import stocksRoutes from './routes/stocks'
import cryptoRoutes from './routes/crypto'
import fxRoutes from './routes/fx'
import newsRoutes from './routes/news'
import errorsRoutes from './routes/errors'
app.use('/api/stocks', stocksRoutes)
app.use('/api/crypto', cryptoRoutes)
app.use('/api/fx', fxRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/errors', errorsRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err, 'ErrorHandler')
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

export default app

