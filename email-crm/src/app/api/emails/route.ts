import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendEmail } from "@/lib/gmail"
import { getFollowUpDate } from "@/lib/utils"
import { addToQueue } from "@/lib/redis"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const emails = await prisma.email.findMany({
      orderBy: { sentAt: "desc" },
    })
    return NextResponse.json(emails)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { recipient, subject, content } = await request.json()

    // Send email using Gmail API
    const gmailResponse = await sendEmail(recipient, subject, content)

    // Create email record in database
    const email = await prisma.email.create({
      data: {
        recipient,
        subject,
        content,
        status: "sent",
        sentAt: new Date(),
      },
    })

    // Schedule follow-up
    const followUpDate = getFollowUpDate()
    await addToQueue({
      emailId: email.id,
      scheduledAt: followUpDate,
    })

    return NextResponse.json(email)
  } catch (error) {
    console.error("Failed to send email:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
} 