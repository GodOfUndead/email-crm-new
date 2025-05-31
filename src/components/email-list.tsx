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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Email {
  id: string
  subject: string
  content: string
  status: "DRAFT" | "SENT" | "FAILED"
  clientId: string
  sentAt: string | null
  createdAt: string
}

export function EmailList() {
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch("/api/emails")
        if (!response.ok) throw new Error("Failed to fetch emails")
        const data = await response.json()
        setEmails(data)
      } catch (error) {
        console.error("Error fetching emails:", error)
        toast.error("Failed to load emails")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmails()
  }, [])

  if (isLoading) {
    return <div>Loading emails...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow key={email.id}>
              <TableCell className="font-medium">{email.subject}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    email.status === "SENT"
                      ? "default"
                      : email.status === "DRAFT"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {email.status.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                {email.sentAt
                  ? format(new Date(email.sentAt), "MMM d, yyyy HH:mm")
                  : "-"}
              </TableCell>
              <TableCell>
                {format(new Date(email.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
          {emails.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No emails found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 