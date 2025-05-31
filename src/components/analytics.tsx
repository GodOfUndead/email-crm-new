"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface AnalyticsProps {
  type: "emails_sent" | "replies_received" | "follow_ups_needed"
}

const titles: Record<AnalyticsProps["type"], string> = {
  emails_sent: "Emails Sent",
  replies_received: "Replies Received",
  follow_ups_needed: "Follow-ups Needed",
}

export function Analytics({ type }: AnalyticsProps) {
  const [value, setValue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/${type}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`)
        }
        const data = await response.json()
        setValue(data.value)
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        toast.error(`Failed to load ${titles[type]}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [type])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titles[type]}</CardTitle>
        {/* Icon could go here */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "Loading..." : value !== null ? value : "N/A"}
        </div>
      </CardContent>
    </Card>
  )
} 