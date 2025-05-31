import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const QUEUE_KEY = "email_crm_queue"

interface QueueItem {
  type: "follow-up" // Define other types as needed
  data: any // Specific data structure depends on the type
}

export async function addToQueue(item: QueueItem) {
  try {
    await redis.rpush(QUEUE_KEY, JSON.stringify(item))
    console.log("Added item to queue:", item)
  } catch (error) {
    console.error("Failed to add item to queue:", error)
    throw error // Or handle appropriately
  }
}

export async function processQueue() {
  try {
    // Atomically fetch and remove an item from the queue
    const itemJson = await redis.lpop(QUEUE_KEY)
  
    if (!itemJson || typeof itemJson !== 'string') {
      console.log("Queue is empty.")
      return null
    }
  
    const item: QueueItem = JSON.parse(itemJson)
    console.log("Processing item from queue:", item)
  
    // Process the item based on its type
    switch (item.type) {
      case "follow-up":
        // Call a function to handle follow-up processing
        // This might involve fetching the follow-up record, generating content, and sending the email
        console.log("Processing follow-up item:", item.data ? JSON.stringify(item.data) : 'No data');
        // Example: await processFollowUp(item.data.followUpId)
        break
      // Add cases for other item types
      default:
        console.warn("Unknown queue item type:", item.type)
        break
    }
    
    return item
  } catch (error) {
    console.error("Error processing queue:", error)
    // Depending on the error, you might want to re-add the item to a dead-letter queue
    throw error // Or handle appropriately
  }
}

// Example function (implement based on your application logic)
/*
async function processFollowUp(followUpId: string) {
    // Fetch follow-up details from DB using followUpId
    // Generate content using AI
    // Send email using gmail utility
    // Update follow-up status in DB
    console.log(`Processing follow-up with ID: ${followUpId}`)
    // Add your logic here
}
*/

export async function getQueueLength(queue: string) {
  return await redis.llen(queue)
} 