import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const analyticsTypes = ["emails", "follow-ups", "replies"] as const
type AnalyticsType = typeof analyticsTypes[number]

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type as AnalyticsType

    if (!analyticsTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid analytics type" },
        { status: 400 }
      )
    }

    let data
    switch (type) {
      case "emails":
        data = await prisma.email.groupBy({
          by: ["status"],
          _count: true,
        })
        break
      case "follow-ups":
        data = await prisma.followUp.groupBy({
          by: ["status"],
          _count: true,
        })
        break
      case "replies":
        data = await prisma.email.groupBy({
          by: ["status"],
          where: {
            status: "REPLIED",
          },
          _count: true,
        })
        break
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 