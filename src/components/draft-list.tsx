"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Draft {
  id: string
  subject: string
  content: string
  clientId: string
  clientName: string
  createdAt: string
}

export function DraftList() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch("/api/emails?status=DRAFT")
        if (!response.ok) throw new Error("Failed to fetch drafts")
        const data = await response.json()
        setDrafts(data)
      } catch (error) {
        console.error("Error fetching drafts:", error)
        toast.error("Failed to load drafts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrafts()
  }, [])

  const handleSend = async (draftId: string) => {
    try {
      const response = await fetch(`/api/emails/${draftId}/send`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to send email")

      toast.success("Email sent successfully")
      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId))
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email")
    }
  }

  const handleDelete = async (draftId: string) => {
    try {
      const response = await fetch(`/api/emails/${draftId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete draft")

      toast.success("Draft deleted successfully")
      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId))
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast.error("Failed to delete draft")
    }
  }

  if (isLoading) {
    return <div>Loading drafts...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drafts.map((draft) => (
            <TableRow key={draft.id}>
              <TableCell className="font-medium">{draft.subject}</TableCell>
              <TableCell>{draft.clientName}</TableCell>
              <TableCell>
                {format(new Date(draft.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-right space-x-2">
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
          {drafts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No drafts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 