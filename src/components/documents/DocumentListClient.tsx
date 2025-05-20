
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit3, Share2, Trash2, MoreVertical, FileText, Eye, X } from "lucide-react";
import type { DocumentMetadata } from "@/lib/types";
import { DocumentType } from "@/lib/types";
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
  const [documentsToDisplay, setDocumentsToDisplay] = useState<DocumentMetadataWithDisplayDate[] | null>(null);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<DocumentMetadata | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DocumentMetadata["status"] | "all">("all");

  useEffect(() => {
    const filtered = initialDocuments.filter(doc => {
      const nameMatch = filterName === "" || doc.name.toLowerCase().includes(filterName.toLowerCase());
      const typeMatch = filterType === "all" || doc.type === filterType;
      const statusMatch = filterStatus === "all" || doc.status === filterStatus;
      return nameMatch && typeMatch && statusMatch;
    });

    const docsWithFormattedData = filtered.map(doc => ({
      ...doc,
      displayUpdatedAt: format(new Date(doc.updatedAt), "dd MMM, yyyy", { locale: ptBR }),
      displayStatus: doc.status === "Published" ? "Publicado" : doc.status === "Draft" ? "Rascunho" : doc.status,
    }));
    setDocumentsToDisplay(docsWithFormattedData);
  }, [initialDocuments, filterName, filterType, filterStatus]);

  const handleShare = (doc: DocumentMetadata) => {
    setSelectedDocumentForShare(doc);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (docId: string) => {
    console.log("Excluir documento:", docId);
    // TODO: Call server action to delete document
    // For now, just filter out from client-side display
    setDocumentsToDisplay(prevDocs => prevDocs ? prevDocs.filter(doc => doc.id !== docId) : null);
  };
  
  const handleClearFilters = () => {
    setFilterName("");
    setFilterType("all");
    setFilterStatus("all");
  };

  if (documentsToDisplay === null && initialDocuments.length > 0) {
    return (
      <div className="rounded-lg border shadow-sm bg-card">
        <div className="mb-4 p-4 border rounded-lg bg-card shadow">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Filtros</h3>
          {/* Placeholder for filters while loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
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
  
  const currentDocuments = documentsToDisplay || [];

  return (
    <>
      <div className="mb-6 p-4 border rounded-lg bg-card shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="filterName" className="text-sm font-medium text-muted-foreground db-block mb-1">Nome do Documento</Label>
            <Input
              id="filterName"
              placeholder="Buscar por nome..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="filterType" className="text-sm font-medium text-muted-foreground db-block mb-1">Tipo</Label>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as DocumentType | "all")}>
              <SelectTrigger id="filterType" className="mt-1">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.values(DocumentType).map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filterStatus" className="text-sm font-medium text-muted-foreground db-block mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as DocumentMetadata["status"] | "all")}>
              <SelectTrigger id="filterStatus" className="mt-1">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Draft">Rascunho</SelectItem>
                <SelectItem value="Published">Publicado</SelectItem>
                <SelectItem value="Archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleClearFilters} size="sm">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>

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
            {currentDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum documento encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              currentDocuments.map((doc) => (
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
                           <Link href={`/documents/${doc.id}/edit`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Visualizar/Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(doc)} className="flex items-center cursor-pointer">
                          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive flex items-center cursor-pointer">
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
