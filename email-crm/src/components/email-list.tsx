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

type Email = {
  id: string
  subject: string
  recipient: string
  status: string
  sentAt: string
  repliedAt?: string
}

export function EmailList() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/emails")
      const data = await response.json()
      setEmails(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch emails",
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
          <TableHead>Subject</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent At</TableHead>
          <TableHead>Replied At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id}>
            <TableCell>{email.subject}</TableCell>
            <TableCell>{email.recipient}</TableCell>
            <TableCell>
              <Badge
                variant={
                  email.status === "replied"
                    ? "success"
                    : email.status === "follow-up"
                    ? "warning"
                    : "default"
                }
              >
                {email.status}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(email.sentAt), "MMM d, yyyy HH:mm")}
            </TableCell>
            <TableCell>
              {email.repliedAt
                ? format(new Date(email.repliedAt), "MMM d, yyyy HH:mm")
                : "-"}
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 