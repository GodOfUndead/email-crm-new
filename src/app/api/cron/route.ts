import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { processQueue } from "@/lib/queue"
import { ClientStatus } from "@prisma/client"

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
        status: ClientStatus.CONTACTED,
      },
      data: {
        status: ClientStatus.NEW,
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