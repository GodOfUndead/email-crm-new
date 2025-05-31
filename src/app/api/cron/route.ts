import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { processQueue } from "@/lib/queue"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    // Verify the secret key
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Process the follow-up queue
    await processQueue()

    // Update client statuses
    const today = new Date()
    await prisma.client.updateMany({
      where: {
        nextFollowUp: {
          lte: today,
        },
        status: "active",
      },
      data: {
        status: "follow_up_needed",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process cron job" },
      { status: 500 }
    )
  }
} 