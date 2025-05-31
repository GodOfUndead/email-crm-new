import { Redis } from "@upstash/redis"

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing Redis environment variables")
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function addToQueue(queue: string, data: any) {
  return await redis.lpush(queue, JSON.stringify(data))
}

export async function processQueue(queue: string) {
  const item = await redis.rpop(queue)
  return item ? JSON.parse(item) : null
}

export async function getQueueLength(queue: string) {
  return await redis.llen(queue)
} 