"use client";

import { useEffect, useState } from "react";
import { DraftReview } from "@/components/draft-review";
import { toast } from "sonner";

interface Draft {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  status: string;
  threadId?: string;
  sentAt: string;
  type: "email" | "follow-up";
  scheduledAt?: string;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      // Fetch email drafts
      const emailResponse = await fetch("/api/emails?status=draft");
      const emailDrafts = await emailResponse.json();

      // Fetch follow-up drafts
      const followUpResponse = await fetch("/api/follow-ups?status=pending");
      const followUpDrafts = await followUpResponse.json();

      // Combine and format drafts
      const allDrafts = [
        ...emailDrafts.map((draft: any) => ({
          ...draft,
          type: "email" as const,
        })),
        ...followUpDrafts.map((draft: any) => ({
          ...draft,
          type: "follow-up" as const,
        })),
      ];

      setDrafts(allDrafts);
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
      toast.error("Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (draftId: string) => {
    try {
      const response = await fetch(`/api/emails/${draftId}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send draft");
      }

      toast.success("Draft sent successfully");
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error("Failed to send draft:", error);
      toast.error("Failed to send draft");
    }
  };

  const handleDelete = async (draftId: string) => {
    try {
      const response = await fetch(`/api/emails/${draftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      toast.success("Draft deleted successfully");
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete draft:", error);
      toast.error("Failed to delete draft");
    }
  };

  const handleEdit = async (draftId: string, content: string) => {
    try {
      const response = await fetch(`/api/emails/${draftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update draft");
      }

      toast.success("Draft updated successfully");
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error("Failed to update draft:", error);
      toast.error("Failed to update draft");
    }
  };

  if (isLoading) {
    return <div>Loading drafts...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <DraftReview
        drafts={drafts}
        onSend={handleSend}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
} 