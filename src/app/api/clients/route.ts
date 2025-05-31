import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Client, Email, FollowUp } from "@prisma/client"

const createClientSchema = z.object({
  companyName: z.string(),
  leadName: z.string(),
  email: z.string().email(),
  lastContactDate: z.string().optional(),
  nextFollowUp: z.string().optional(),
  proposalLink: z.string().optional(),
  proposedSolution: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "NEGOTIATING", "CLOSED", "LOST"]).default("NEW"),
})

const updateClientSchema = createClientSchema.partial()

type ClientWithRelations = Client & {
  emails: Email[];
  followUps: FollowUp[];
}

export async function GET() {
  try {
    const clients = await prisma.$queryRaw`
      SELECT 
        c.*,
        (
          SELECT json_agg(e.*)
          FROM "Email" e
          WHERE e."clientId" = c.id
          ORDER BY e."sentAt" DESC
          LIMIT 1
        ) as latest_email,
        (
          SELECT json_agg(f.*)
          FROM "FollowUp" f
          WHERE f."clientId" = c.id
          AND f.status = 'PENDING'
          ORDER BY f."scheduledAt" ASC
          LIMIT 1
        ) as next_follow_up
      FROM "Client" c
      ORDER BY c."lastContactDate" DESC
    `

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = createClientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...data,
        lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : new Date(),
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error creating client:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateClientSchema.parse(body)

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
} 