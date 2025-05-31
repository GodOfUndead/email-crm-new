import { Client } from "@prisma/client"

interface PipedriveConfig {
  apiKey: string
  domain: string
}

// Define a type that matches our Prisma Client model
type ClientWithEmail = Client & {
  email: string;
}

class PipedriveService {
  private config: PipedriveConfig
  private baseUrl: string

  constructor(config: PipedriveConfig) {
    this.config = config
    this.baseUrl = `https://${config.domain}.pipedrive.com/api/v1`
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}?api_token=${this.config.apiKey}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.statusText}`)
    }

    return response.json()
  }

  async createOrUpdateOrganization(client: ClientWithEmail) {
    const orgData = {
      name: client.companyName || "Unknown Company",
      visible_to: 3, // Entire company
    }

    if (client.pipedriveOrgId) {
      return this.request(`/organizations/${client.pipedriveOrgId}`, {
        method: "PUT",
        body: JSON.stringify(orgData),
      })
    }

    const response = await this.request("/organizations", {
      method: "POST",
      body: JSON.stringify(orgData),
    })

    return response.data
  }

  async createOrUpdatePerson(client: ClientWithEmail) {
    const personData = {
      name: client.leadName,
      email: [client.email],
      visible_to: 3,
      org_id: client.pipedriveOrgId,
    }

    if (client.pipedrivePersonId) {
      return this.request(`/persons/${client.pipedrivePersonId}`, {
        method: "PUT",
        body: JSON.stringify(personData),
      })
    }

    const response = await this.request("/persons", {
      method: "POST",
      body: JSON.stringify(personData),
    })

    return response.data
  }

  async createOrUpdateDeal(client: ClientWithEmail) {
    const dealData = {
      title: `${client.companyName || "Unknown"} - ${client.status}`,
      person_id: client.pipedrivePersonId,
      org_id: client.pipedriveOrgId,
      status: this.mapClientStatusToDealStatus(client.status),
      visible_to: 3,
      custom_fields: {
        proposal_link: client.proposalLink,
        proposed_solution: client.proposedSolution,
        next_follow_up: client.nextFollowUp?.toISOString(),
      },
    }

    if (client.pipedriveDealId) {
      return this.request(`/deals/${client.pipedriveDealId}`, {
        method: "PUT",
        body: JSON.stringify(dealData),
      })
    }

    const response = await this.request("/deals", {
      method: "POST",
      body: JSON.stringify(dealData),
    })

    return response.data
  }

  private mapClientStatusToDealStatus(status: string): string {
    const statusMap: Record<string, string> = {
      NEW: "open",
      CONTACTED: "open",
      PROPOSAL_SENT: "open",
      NEGOTIATING: "open",
      CLOSED: "won",
      LOST: "lost",
    }
    return statusMap[status] || "open"
  }

  async syncClient(client: ClientWithEmail) {
    try {
      // Create or update organization
      const org = await this.createOrUpdateOrganization(client)
      
      // Create or update person
      const person = await this.createOrUpdatePerson(client)
      
      // Create or update deal
      const deal = await this.createOrUpdateDeal(client)

      return {
        pipedriveOrgId: org.id,
        pipedrivePersonId: person.id,
        pipedriveDealId: deal.id,
      }
    } catch (error) {
      console.error("Failed to sync client with Pipedrive:", error)
      throw error
    }
  }
}

export const pipedriveService = new PipedriveService({
  apiKey: process.env.PIPEDRIVE_API_KEY || "",
  domain: process.env.PIPEDRIVE_DOMAIN || "",
})

interface CreateClientParams {
  name: string
  email: string
  company?: string
}

interface UpdateClientParams {
  name?: string
  email?: string
  company?: string
}

interface CreateDealParams {
  title: string
  personId: number
  orgId?: number
  value?: number
  stageId?: number
}

interface UpdateDealParams {
  title?: string
  value?: number
  stageId?: number
}

export async function createPipedriveClient({
  name,
  email,
  company,
}: CreateClientParams) {
  try {
    // Create or find organization
    let orgId: number | undefined
    if (company) {
      const orgs = await pipedriveService.request(`/organizations/search`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const existingOrg = orgs.data.items[0]?.item

      if (existingOrg) {
        orgId = existingOrg.id
      } else {
        const newOrg = await pipedriveService.request("/organizations", {
          method: "POST",
          body: JSON.stringify({
            name: company,
          }),
        })
        orgId = newOrg.data.id
      }
    }

    // Create person
    const person = await pipedriveService.request("/persons", {
      method: "POST",
      body: JSON.stringify({
        name,
        email: [email],
        org_id: orgId,
      }),
    })

    return {
      personId: person.data.id,
      orgId,
    }
  } catch (error) {
    console.error("Error creating Pipedrive client:", error)
    throw new Error("Failed to create Pipedrive client")
  }
}

export async function updatePipedriveClient(
  personId: number,
  { name, email, company }: UpdateClientParams
) {
  try {
    const updates: any = {}

    if (name) updates.name = name
    if (email) updates.email = [email]

    // Update organization if company name is provided
    if (company) {
      const person = await pipedriveService.request(`/persons/${personId}`, {
        method: "GET",
      })
      const currentOrgId = person.data.org_id

      if (currentOrgId) {
        const orgs = await pipedriveService.request("/organizations/search", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const existingOrg = orgs.data.items[0]?.item

        if (existingOrg) {
          updates.org_id = existingOrg.id
        } else {
          const newOrg = await pipedriveService.request("/organizations", {
            method: "POST",
            body: JSON.stringify({
              name: company,
            }),
          })
          updates.org_id = newOrg.data.id
        }
      } else {
        const newOrg = await pipedriveService.request("/organizations", {
          method: "POST",
          body: JSON.stringify({
            name: company,
          }),
        })
        updates.org_id = newOrg.data.id
      }
    }

    const updatedPerson = await pipedriveService.request(`/persons/${personId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return updatedPerson.data
  } catch (error) {
    console.error("Error updating Pipedrive client:", error)
    throw new Error("Failed to update Pipedrive client")
  }
}

export async function createPipedriveDeal({
  title,
  personId,
  orgId,
  value,
  stageId,
}: CreateDealParams) {
  try {
    const deal = await pipedriveService.request("/deals", {
      method: "POST",
      body: JSON.stringify({
        title,
        person_id: personId,
        org_id: orgId,
        value,
        stage_id: stageId,
      }),
    })

    return deal.data
  } catch (error) {
    console.error("Error creating Pipedrive deal:", error)
    throw new Error("Failed to create Pipedrive deal")
  }
}

export async function updatePipedriveDeal(
  dealId: number,
  { title, value, stageId }: UpdateDealParams
) {
  try {
    const updates: any = {}

    if (title) updates.title = title
    if (value) updates.value = value
    if (stageId) updates.stage_id = stageId

    const updatedDeal = await pipedriveService.request(`/deals/${dealId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return updatedDeal.data
  } catch (error) {
    console.error("Error updating Pipedrive deal:", error)
    throw new Error("Failed to update Pipedrive deal")
  }
}

// You might add other Pipedrive related functions here, e.g., to update deals, find deals, etc.
// export async function updateDeal(...) { ... }
// export async function findDeal(...) { ... }
// export async function getClients(...) { ... } 