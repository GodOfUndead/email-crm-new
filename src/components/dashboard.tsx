"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Analytics } from "@/components/analytics"
import { ClientList } from "@/components/client-list"
import { EmailList } from "@/components/email-list"
import { DraftList } from "@/components/draft-list"
import { toast } from "sonner"

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch initial data if needed
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">CRM Dashboard</h1>
      
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Analytics type="emails_sent" />
        <Analytics type="replies_received" />
        <Analytics type="follow_ups_needed" />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drafts & Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <DraftList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 