import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/gmail"
import { addToQueue } from "@/lib/redis"
import { z } from "zod"

const createFollowUpSchema = z.object({
  emailId: z.string(),
  clientId: z.string(),
  content: z.string().nullable().default(null),
  scheduledFor: z.string().transform((str) => new Date(str)),
})

// This GET route could be used to fetch pending follow-up drafts for review
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const followUps = await prisma.followUp.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        email: true,
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(followUps)
  } catch (error) {
    console.error("Error fetching follow-ups:", error)
    return NextResponse.json(
      { error: "Failed to fetch follow-ups" },
      { status: 500 }
    )
  }
}

// This POST route could be used to manually trigger follow-up generation or processing
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { emailId, clientId, content, scheduledFor } =
      createFollowUpSchema.parse(body)

    const followUp = await prisma.followUp.create({
      data: {
        emailId,
        clientId,
        content: content!,
        status: "PENDING",
        scheduledFor,
      },
      include: {
        email: true,
        client: true,
      },
    })

    // Add to queue for processing
    await addToQueue({
      type: "follow-up",
      data: { followUpId: followUp.id },
    })

    return NextResponse.json(followUp)
  } catch (error) {
    console.error("Error creating follow-up:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create follow-up" },
      { status: 500 }
    )
  }
}

// This PUT route could be used to update a follow-up status or content
// export async function PUT(request: Request) { ... }

// This DELETE route could be used to delete a follow-up draft
// export async function DELETE(request: Request) { ... } 