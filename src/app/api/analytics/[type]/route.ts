import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { EmailStatus } from "@prisma/client"

const analyticsTypes = ["emails", "follow-ups", "replies"] as const
type AnalyticsType = typeof analyticsTypes[number]

type RouteContext = {
  params: {
    type: string
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const type = context.params.type as AnalyticsType

    if (!analyticsTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid analytics type" },
        { status: 400 }
      )
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))

    let data
    switch (type) {
      case "emails":
        data = await prisma.email.count({
          where: {
            createdAt: {
              gte: startOfDay,
            },
          },
        })
        break
      case "follow-ups":
        data = await prisma.followUp.count({
          where: {
            createdAt: {
              gte: startOfDay,
            },
          },
        })
        break
      case "replies":
        data = await prisma.email.count({
          where: {
            status: EmailStatus.REPLIED,
            createdAt: {
              gte: startOfDay,
            },
          },
        })
        break
    }

    return NextResponse.json({ type, data })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 