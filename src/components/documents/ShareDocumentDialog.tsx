
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocumentMetadata } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { shareDocumentAction } from "@/lib/actions";
import { X, UserPlus, Trash2 } from "lucide-react";

interface ShareDocumentDialogProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type SharedUser = { email: string; permission: "view" | "edit" };

export function ShareDocumentDialog({ document, isOpen, onOpenChange }: ShareDocumentDialogProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPermission, setNewPermission] = useState<"view" | "edit">("view");
  const { toast } = useToast();

  useEffect(() => {
    if (document?.sharedWith) {
      setSharedUsers(document.sharedWith);
    } else {
      setSharedUsers([]);
    }
  }, [document]);

  const handleAddUser = () => {
    if (newEmail && !sharedUsers.find(u => u.email === newEmail)) {
      setSharedUsers([...sharedUsers, { email: newEmail, permission: newPermission }]);
      setNewEmail("");
    } else if (sharedUsers.find(u => u.email === newEmail)) {
       toast({ title: "User already added", description: "This email is already in the share list.", variant: "destructive" });
    }
  };

  const handleRemoveUser = (emailToRemove: string) => {
    setSharedUsers(sharedUsers.filter(u => u.email !== emailToRemove));
  };

  const handleSaveChanges = async () => {
    if (!document) return;
    
    const result = await shareDocumentAction(document.id, sharedUsers);
    if (result.success) {
      toast({ title: "Sharing updated", description: `Permissions for ${document.name} have been updated.` });
      onOpenChange(false);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Share "{document.name}"</DialogTitle>
          <DialogDescription>
            Manage who has access to this document. Changes will be reflected in Google Docs (simulated).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-foreground">Add people or groups</Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-grow"
              />
              <Select value={newPermission} onValueChange={(value: "view" | "edit") => setNewPermission(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser} variant="outline" size="icon" aria-label="Add user">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">Shared with</Label>
              <ul className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-2">
                {sharedUsers.map((user) => (
                  <li key={user.email} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.permission === "edit" ? "Editor" : "Viewer"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.email)} aria-label={`Remove ${user.email}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
