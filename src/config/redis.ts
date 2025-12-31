import Redis from 'ioredis'

let redisClient: Redis | null = null

export const getRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully')
  })

  return redisClient
}

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

export default getRedisClient

