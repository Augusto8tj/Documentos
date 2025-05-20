
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, Share2, Trash2, MoreVertical, FileText, Eye } from "lucide-react";
import type { DocumentMetadata } from "@/lib/types";
import { ShareDocumentDialog } from "./ShareDocumentDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentListClientProps {
  documents: DocumentMetadata[];
}

interface DocumentMetadataWithDisplayDate extends DocumentMetadata {
  displayUpdatedAt: string;
  displayStatus: string;
}

export function DocumentListClient({ documents: initialDocuments }: DocumentListClientProps) {
  const [processedDocs, setProcessedDocs] = useState<DocumentMetadataWithDisplayDate[] | null>(null);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<DocumentMetadata | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    // Format dates and status on the client side after initial hydration
    const docsWithFormattedData = initialDocuments.map(doc => ({
      ...doc,
      displayUpdatedAt: format(new Date(doc.updatedAt), "dd MMM, yyyy", { locale: ptBR }),
      displayStatus: doc.status === "Published" ? "Publicado" : doc.status === "Draft" ? "Rascunho" : doc.status,
    }));
    setProcessedDocs(docsWithFormattedData);
  }, [initialDocuments]);

  const handleShare = (doc: DocumentMetadata) => {
    setSelectedDocumentForShare(doc);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (docId: string) => {
    console.log("Excluir documento:", docId);
    setProcessedDocs(prevDocs => prevDocs ? prevDocs.filter(doc => doc.id !== docId) : null);
    // TODO: Call server action to delete document
  };

  if (processedDocs === null && initialDocuments.length > 0) {
    // Still loading/processing client-side dates, show a placeholder
    return (
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Carregando dados dos documentos...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
  
  const documentsToDisplay = processedDocs || [];

  return (
    <>
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              documentsToDisplay.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/documents/${doc.id}`} className="hover:underline flex items-center gap-2">
                       <FileText className="h-4 w-4 text-primary" /> {doc.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.number}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === "Published" ? "default" : "secondary"} className={doc.status === "Published" ? "bg-accent text-accent-foreground" : ""}>
                      {doc.displayStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.displayUpdatedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                           <Link href={`/documents/${doc.id}/edit`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> Visualizar/Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(doc)} className="flex items-center">
                          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive flex items-center">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ShareDocumentDialog
        document={selectedDocumentForShare}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </>
  );
}
