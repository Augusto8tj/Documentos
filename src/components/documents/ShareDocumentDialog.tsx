
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
    // Reset new user fields when dialog opens for a new document or closes
    if (isOpen) {
      setNewEmail("");
      setNewPermission("view");
    }
  }, [document, isOpen]);

  const handleAddUser = () => {
    if (newEmail && !sharedUsers.find(u => u.email === newEmail)) {
      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(newEmail)) {
        toast({ title: "E-mail Inválido", description: "Por favor, insira um endereço de e-mail válido.", variant: "destructive" });
        return;
      }
      setSharedUsers([...sharedUsers, { email: newEmail, permission: newPermission }]);
      setNewEmail("");
    } else if (newEmail && sharedUsers.find(u => u.email === newEmail)) {
       toast({ title: "Usuário já adicionado", description: "Este e-mail já está na lista de compartilhamento.", variant: "destructive" });
    } else if (!newEmail) {
        toast({ title: "E-mail Necessário", description: "Por favor, insira um endereço de e-mail.", variant: "destructive" });
    }
  };

  const handleRemoveUser = (emailToRemove: string) => {
    setSharedUsers(sharedUsers.filter(u => u.email !== emailToRemove));
  };

  const handleSaveChanges = async () => {
    if (!document) return;
    
    const result = await shareDocumentAction(document.id, sharedUsers);
    if (result.success) {
      toast({ title: "Compartilhamento atualizado", description: `As permissões para ${document.name} foram atualizadas.` });
      onOpenChange(false);
    } else {
      toast({ title: "Erro", description: result.error || "Ocorreu um erro desconhecido ao atualizar o compartilhamento.", variant: "destructive" });
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Compartilhar "{document.name}"</DialogTitle>
          <DialogDescription>
            Gerencie quem tem acesso a este documento. As alterações serão refletidas no Google Docs (simulado).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-foreground">Adicionar pessoas ou grupos</Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                type="email"
                placeholder="Digite o endereço de e-mail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-grow"
              />
              <Select value={newPermission} onValueChange={(value: "view" | "edit") => setNewPermission(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Permissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Pode visualizar</SelectItem>
                  <SelectItem value="edit">Pode editar</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser} variant="outline" size="icon" aria-label="Adicionar usuário">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">Compartilhado com</Label>
              <ul className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-2">
                {sharedUsers.map((user) => (
                  <li key={user.email} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.permission === "edit" ? "Editor" : "Visualizador"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.email)} aria-label={`Remover ${user.email}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
           {sharedUsers.length === 0 && newEmail === "" && (
             <p className="text-sm text-center text-muted-foreground pt-2">Ninguém foi adicionado ainda.</p>
           )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
