import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateFollowUpContent } from "@/lib/ai"
import { sendEmail } from "@/lib/gmail"

const prisma = new PrismaClient()

// Get all follow-up drafts
export async function GET() {
  try {
    const drafts = await prisma.followUp.findMany({
      where: { status: "pending" },
      include: {
        email: true,
        client: true,
      },
      orderBy: { scheduledAt: "asc" },
    })
    return NextResponse.json(drafts)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch follow-up drafts" },
      { status: 500 }
    )
  }
}

// Create a new follow-up draft
export async function POST(request: Request) {
  try {
    const { emailId } = await request.json()

    // Get the original email
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: { client: true },
    })

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      )
    }

    // Generate follow-up content using AI
    const followUpContent = await generateFollowUpContent({
      subject: email.subject,
      content: email.content,
      recipient: email.recipient,
    })

    // Create follow-up draft
    const followUp = await prisma.followUp.create({
      data: {
        emailId: email.id,
        clientId: email.client?.id || "",
        content: followUpContent,
        status: "pending",
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      },
    })

    return NextResponse.json(followUp)
  } catch (error) {
    console.error("Failed to create follow-up draft:", error)
    return NextResponse.json(
      { error: "Failed to create follow-up draft" },
      { status: 500 }
    )
  }
}

// Send a follow-up draft
export async function PUT(request: Request) {
  try {
    const { id } = await request.json()

    // Get the follow-up draft
    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: {
        email: true,
        client: true,
      },
    })

    if (!followUp) {
      return NextResponse.json(
        { error: "Follow-up draft not found" },
        { status: 404 }
      )
    }

    // Send the follow-up email
    await sendEmail(
      followUp.email.recipient,
      `Re: ${followUp.email.subject}`,
      followUp.content
    )

    // Update follow-up status
    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: { status: "sent" },
    })

    return NextResponse.json(updatedFollowUp)
  } catch (error) {
    console.error("Failed to send follow-up:", error)
    return NextResponse.json(
      { error: "Failed to send follow-up" },
      { status: 500 }
    )
  }
} 