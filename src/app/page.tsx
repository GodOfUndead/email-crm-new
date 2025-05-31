"use client"

import { useEffect, useState } from "react";
import { ClientList } from "@/components/client-list";
import { Analytics } from "@/components/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">CRM Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Analytics type="emails_sent" />
        <Analytics type="replies_received" />
        <Analytics type="follow_ups_needed" />
      </div>
      <ClientList />
      <Toaster />
    </div>
  );
} 