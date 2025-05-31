"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Client {
  id: string
  name: string
  email: string
}

interface EmailComposerProps {
  clients: Client[]
  onEmailSent?: () => void
}

export function EmailComposer({ clients, onEmailSent }: EmailComposerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    subject: "",
    content: "",
    tone: "professional",
    length: "medium",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, generate email content using AI
      const generateResponse = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clients.find((c) => c.id === formData.clientId)?.name,
          context: formData.content,
          tone: formData.tone,
          length: formData.length,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error("Failed to generate email")
      }

      const { subject, body } = await generateResponse.json()

      // Then, save the email
      const saveResponse = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          subject,
          content: body,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save email")
      }

      toast.success("Email draft created successfully")
      setFormData({
        clientId: "",
        subject: "",
        content: "",
        tone: "professional",
        length: "medium",
      })
      onEmailSent?.()
      router.refresh()
    } catch (error) {
      console.error("Error creating email:", error)
      toast.error("Failed to create email draft")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="client" className="text-sm font-medium">
          Client
        </label>
        <Select
          value={formData.clientId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, clientId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} ({client.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="context" className="text-sm font-medium">
          Email Context
        </label>
        <Textarea
          id="context"
          placeholder="Describe what you want to communicate..."
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="tone" className="text-sm font-medium">
            Tone
          </label>
          <Select
            value={formData.tone}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, tone: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="length" className="text-sm font-medium">
            Length
          </label>
          <Select
            value={formData.length}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, length: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Draft"}
      </Button>
    </form>
  )
} 