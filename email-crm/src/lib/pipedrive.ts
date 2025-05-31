import { Client } from "@pipedrive/api-client"

if (!process.env.PIPEDRIVE_API_KEY) {
  throw new Error("Missing Pipedrive API key")
}

const pipedrive = new Client({
  apiKey: process.env.PIPEDRIVE_API_KEY,
})

export async function createPipedriveClient({
  companyName,
  leadName,
  lastContactDate,
  nextFollowUp,
  proposalLink,
  proposedSolution,
  status,
}: {
  companyName: string
  leadName: string
  lastContactDate: Date
  nextFollowUp?: Date
  proposalLink?: string
  proposedSolution?: string
  status: string
}) {
  try {
    // Create organization
    const org = await pipedrive.organizations.createOrganization({
      name: companyName,
    })

    // Create person
    const person = await pipedrive.persons.createPerson({
      name: leadName,
      org_id: org.data.id,
    })

    // Create deal
    const deal = await pipedrive.deals.createDeal({
      title: `${companyName} - ${leadName}`,
      person_id: person.data.id,
      org_id: org.data.id,
      status: status,
      add_time: lastContactDate.toISOString(),
    })

    // Add custom fields
    if (proposalLink) {
      await pipedrive.deals.updateDeal({
        id: deal.data.id,
        proposal_link: proposalLink,
      })
    }

    if (proposedSolution) {
      await pipedrive.deals.updateDeal({
        id: deal.data.id,
        proposed_solution: proposedSolution,
      })
    }

    if (nextFollowUp) {
      await pipedrive.deals.updateDeal({
        id: deal.data.id,
        next_follow_up: nextFollowUp.toISOString(),
      })
    }

    return {
      orgId: org.data.id,
      personId: person.data.id,
      dealId: deal.data.id,
    }
  } catch (error) {
    console.error("Failed to create Pipedrive client:", error)
    throw error
  }
}

export async function updatePipedriveClient({
  orgId,
  personId,
  dealId,
  lastContactDate,
  nextFollowUp,
  status,
}: {
  orgId: string
  personId: string
  dealId: string
  lastContactDate?: Date
  nextFollowUp?: Date
  status?: string
}) {
  try {
    if (lastContactDate) {
      await pipedrive.deals.updateDeal({
        id: dealId,
        add_time: lastContactDate.toISOString(),
      })
    }

    if (nextFollowUp) {
      await pipedrive.deals.updateDeal({
        id: dealId,
        next_follow_up: nextFollowUp.toISOString(),
      })
    }

    if (status) {
      await pipedrive.deals.updateDeal({
        id: dealId,
        status: status,
      })
    }
  } catch (error) {
    console.error("Failed to update Pipedrive client:", error)
    throw error
  }
} 