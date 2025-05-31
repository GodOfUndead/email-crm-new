import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function addToQueue(task: any) {
  return redis.lpush("email-tasks", JSON.stringify(task))
}

export async function processQueue() {
  const task = await redis.rpop("email-tasks")
  if (!task) return null
  return JSON.parse(task)
}

export async function getQueueLength() {
  return redis.llen("email-tasks")
} 