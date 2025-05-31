import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createPipedriveClient, updatePipedriveClient } from "@/lib/pipedrive"

const prisma = new PrismaClient()

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

export async function POST(request: Request) {
  try {
    const {
      companyName,
      leadName,
      lastContactDate,
      nextFollowUp,
      proposalLink,
      proposedSolution,
      status,
    } = await request.json()

    // Create client in Pipedrive
    const pipedriveIds = await createPipedriveClient({
      companyName,
      leadName,
      lastContactDate: new Date(lastContactDate),
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      proposalLink,
      proposedSolution,
      status,
    })

    // Create client in local database
    const client = await prisma.client.create({
      data: {
        companyName,
        leadName,
        lastContactDate: new Date(lastContactDate),
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        proposalLink,
        proposedSolution,
        status,
        pipedriveOrgId: pipedriveIds.orgId,
        pipedrivePersonId: pipedriveIds.personId,
        pipedriveDealId: pipedriveIds.dealId,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const {
      id,
      lastContactDate,
      nextFollowUp,
      status,
    } = await request.json()

    // Get client from database
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
    await updatePipedriveClient({
      orgId: client.pipedriveOrgId!,
      personId: client.pipedrivePersonId!,
      dealId: client.pipedriveDealId!,
      lastContactDate: lastContactDate ? new Date(lastContactDate) : undefined,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      status,
    })

    // Update client in local database
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        lastContactDate: lastContactDate ? new Date(lastContactDate) : undefined,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
        status,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    )
  }
} 