"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Draft {
  id: string;
  subject: string;
  content: string;
  clientId: string;
  clientName: string;
  createdAt: string;
}

interface DraftReviewProps {
  draft: Draft;
  onSend: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onClose: () => void;
}

export function DraftReview({
  draft,
  onSend,
  onDelete,
  onEdit,
  onClose,
}: DraftReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedContent, setEditedContent] = useState(draft.content);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await onSend(draft.id);
      onClose();
    } catch (error) {
      console.error("Error sending draft:", error);
      toast.error("Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(draft.id);
      onClose();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await onEdit(draft.id, editedContent);
      toast.success("Draft updated successfully");
    } catch (error) {
      console.error("Error updating draft:", error);
      toast.error("Failed to update draft");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Draft</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Subject</h3>
            <p className="text-sm text-muted-foreground">{draft.subject}</p>
          </div>

          <div>
            <h3 className="font-medium">To</h3>
            <p className="text-sm text-muted-foreground">{draft.clientName}</p>
          </div>

          <div>
            <h3 className="font-medium">Content</h3>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isLoading || editedContent === draft.content}
          >
            Save Changes
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 