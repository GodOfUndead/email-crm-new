"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Client = {
  id: string
  companyName: string
  leadName: string
  lastContactDate: string
  nextFollowUp: string | null
  proposalLink: string | null
  proposedSolution: string | null
  status: string
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Lead</TableHead>
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
              {format(new Date(client.lastContactDate), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              {client.nextFollowUp
                ? format(new Date(client.nextFollowUp), "MMM d, yyyy")
                : "-"}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  client.status === "active"
                    ? "success"
                    : client.status === "pending"
                    ? "warning"
                    : "default"
                }
              >
                {client.status}
              </Badge>
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
  )
} 