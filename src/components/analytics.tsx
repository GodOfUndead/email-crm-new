"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type AnalyticsProps = {
  type: "emails_sent" | "replies_received" | "follow_ups_needed"
}

const titles = {
  emails_sent: "Emails Sent",
  replies_received: "Replies Received",
  follow_ups_needed: "Follow-ups Needed",
}

export function Analytics({ type }: AnalyticsProps) {
  const [value, setValue] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [type])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${type}`)
      const data = await response.json()
      setValue(data.value)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titles[type]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "Loading..." : value}
        </div>
      </CardContent>
    </Card>
  )
} 