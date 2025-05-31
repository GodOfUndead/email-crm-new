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

type Draft = {
  id: string
  emailId: string
  content: string
  createdAt: string
  status: string
  originalEmail: {
    subject: string
    recipient: string
  }
}

export function DraftList() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts")
      const data = await response.json()
      setDrafts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch drafts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts/${draftId}/send`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to send draft")

      toast({
        title: "Success",
        description: "Draft sent successfully",
      })
      fetchDrafts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send draft",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete draft")

      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
      fetchDrafts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Original Subject</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell>{draft.originalEmail.subject}</TableCell>
            <TableCell>{draft.originalEmail.recipient}</TableCell>
            <TableCell>
              {format(new Date(draft.createdAt), "MMM d, yyyy HH:mm")}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{draft.status}</Badge>
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSend(draft.id)}
              >
                Send
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(draft.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 