import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { createPipedriveClient, updatePipedriveClient, createPipedriveDeal, updatePipedriveDeal } from "@/lib/pipedrive"
import { z } from "zod"

const createClientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
})

const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
})

const createDealSchema = z.object({
  title: z.string(),
  personId: z.number(),
  orgId: z.number().optional(),
  value: z.number().optional(),
  stageId: z.number().optional(),
})

const updateDealSchema = z.object({
  title: z.string().optional(),
  value: z.number().optional(),
  stageId: z.number().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    if (type === "deals") {
      // Handle deals GET request
      return NextResponse.json({ message: "Deals endpoint" })
    }

    // Default to clients
    const clients = await prisma.client.findMany({
      orderBy: { lastContactDate: "desc" },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const body = await req.json()

    if (type === "deals") {
      const { title, personId, orgId, value, stageId } = createDealSchema.parse(body)
      const deal = await createPipedriveDeal({
        title,
        personId,
        orgId,
        value,
        stageId,
      })
      return NextResponse.json(deal)
    }

    // Default to client creation
    const { name, email, company } = createClientSchema.parse(body)
    const { personId, orgId } = await createPipedriveClient({
      name,
      email,
      company,
    })

    const client = await prisma.client.create({
      data: {
        leadName: name,
        email,
        companyName: company || "",
        pipedriveId: personId.toString(),
        lastContactDate: new Date(),
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error creating resource:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type")

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()

    if (type === "deals") {
      const { title, value, stageId } = updateDealSchema.parse(body)
      const deal = await updatePipedriveDeal(parseInt(id), {
        title,
        value,
        stageId,
      })
      return NextResponse.json(deal)
    }

    // Default to client update
    const { name, email, company } = updateClientSchema.parse(body)
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    if (client.pipedriveId) {
      await updatePipedriveClient(parseInt(client.pipedriveId), {
        name,
        email,
        company,
      })
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        leadName: name,
        email,
        companyName: company || "",
        lastContactDate: new Date(),
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating resource:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    )
  }
} 