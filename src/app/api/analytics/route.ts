import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let count = 0

    switch (type) {
      case "emails_sent":
        count = await prisma.email.count({
          where: { status: "sent" },
        })
        break
      case "replies_received":
        count = await prisma.email.count({
          where: { status: "replied" },
        })
        break
      case "follow_ups_needed":
        count = await prisma.followUpDraft.count({
          where: { status: "pending" },
        })
        break
      default:
        return NextResponse.json(
          { error: "Invalid analytics type" },
          { status: 400 }
        )
    }

    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 