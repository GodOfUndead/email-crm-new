"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface Client {
  id: string
  companyName: string
  leadName: string
  lastContactDate: string
  nextFollowUpDate?: string | null
  proposalLink?: string | null
  proposedSolution?: string | null
  status: string
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast.error("Failed to load clients.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (isLoading) {
    return <div>Loading clients...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Lead Name</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.companyName}</TableCell>
                <TableCell>{client.leadName}</TableCell>
                <TableCell>
                  {format(new Date(client.lastContactDate), "PPP")}
                </TableCell>
                <TableCell>
                  {client.nextFollowUpDate
                    ? format(new Date(client.nextFollowUpDate), "PPP")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{client.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 