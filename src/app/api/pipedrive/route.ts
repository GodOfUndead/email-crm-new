import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createPipedriveClient, updatePipedriveClient, findOrCreateOrganization, findOrCreatePerson, createDeal } from "@/lib/pipedrive"
import { z } from "zod"

const prisma = new PrismaClient()

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

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { lastContactDate: "desc" },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company } = createClientSchema.parse(body)

    // Create client in Pipedrive
    const { personId, orgId } = await createPipedriveClient({
      name,
      email,
      company,
    })

    // Create client in our database
    const client = await prisma.client.create({
      data: {
        name,
        email,
        company,
        pipedriveId: personId.toString(),
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
    const { name, email, company } = updateClientSchema.parse(body)

    // Get client from our database
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    // Update client in Pipedrive
    if (client.pipedriveId) {
      await updatePipedriveClient(parseInt(client.pipedriveId), {
        name,
        email,
        company,
      })
    }

    // Update client in our database
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        company,
      },
    })

    return NextResponse.json(updatedClient)
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

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { title, personId, orgId, value, stageId } =
      createDealSchema.parse(body)

    // Create deal in Pipedrive
    const deal = await createPipedriveDeal({
      title,
      personId,
      orgId,
      value,
      stageId,
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error("Error creating deal:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    )
  }
}

export async function PATCH_DEAL(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Deal ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { title, value, stageId } = updateDealSchema.parse(body)

    // Update deal in Pipedrive
    const deal = await updatePipedriveDeal(parseInt(id), {
      title,
      value,
      stageId,
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error("Error updating deal:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    )
  }
} 