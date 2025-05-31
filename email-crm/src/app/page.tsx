"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailList } from "@/components/email-list"
import { DraftList } from "@/components/draft-list"
import { ClientList } from "@/components/client-list"
import { Analytics } from "@/components/analytics"
import { EmailComposer } from "@/components/email-composer"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Email CRM</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Analytics type="emails_sent" />
        <Analytics type="replies_received" />
        <Analytics type="follow_ups_needed" />
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-end">
            <EmailComposer />
          </div>
          <EmailList />
        </TabsContent>

        <TabsContent value="drafts">
          <DraftList />
        </TabsContent>

        <TabsContent value="clients">
          <ClientList />
        </TabsContent>
      </Tabs>
    </main>
  )
} 