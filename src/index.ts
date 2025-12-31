import app from './app'
import { logger } from './utils/logger'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, undefined, 'Server')
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`, undefined, 'Server')
  logger.info(`Log level: ${process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info')}`, undefined, 'Server')
})

