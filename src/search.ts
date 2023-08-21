import { redis, redisVectorStore } from './redis-store'

async function search() {
  await redis.connect()

  const response = await redisVectorStore.similaritySearchWithScore(
    'Como criar um cadastro?',
    10
  )

  await redis.disconnect()
}

search();