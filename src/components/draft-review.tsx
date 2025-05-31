import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface DraftReviewProps {
  drafts: Draft[];
  onSend: (draftId: string) => Promise<void>;
  onDelete: (draftId: string) => Promise<void>;
  onEdit: (draftId: string, content: string) => Promise<void>;
}

export function DraftReview({ drafts, onSend, onDelete, onEdit }: DraftReviewProps) {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const handleEdit = async () => {
    if (selectedDraft && editedContent) {
      await onEdit(selectedDraft.id, editedContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Draft Review</h2>
      <div className="grid gap-4">
        {drafts.map((draft) => (
          <Card key={draft.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={draft.type === "email" ? "default" : "secondary"}>
                    {draft.type === "email" ? "Email" : "Follow-up"}
                  </Badge>
                  <Badge variant="outline">{draft.status}</Badge>
                </div>
                <h3 className="font-semibold">{draft.subject}</h3>
                <p className="text-sm text-gray-500">To: {draft.recipient}</p>
                {draft.scheduledAt && (
                  <p className="text-sm text-gray-500">
                    Scheduled: {new Date(draft.scheduledAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedDraft(draft)}>
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Review Draft</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Subject</Label>
                        <p className="font-medium">{draft.subject}</p>
                      </div>
                      <div>
                        <Label>Recipient</Label>
                        <p>{draft.recipient}</p>
                      </div>
                      <div>
                        <Label>Content</Label>
                        {isEditing ? (
                          <textarea
                            className="w-full h-48 p-2 border rounded-md"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                          />
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                            {draft.content}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                setEditedContent(draft.content);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleEdit}>Save Changes</Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(true);
                                setEditedContent(draft.content);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => onDelete(draft.id)}
                            >
                              Delete
                            </Button>
                            <Button onClick={() => onSend(draft.id)}>Send</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 