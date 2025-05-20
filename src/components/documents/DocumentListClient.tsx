
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
import { Edit3, Share2, Trash2, MoreVertical, FileText, Eye, X, Link2, Users, CalendarIcon, Filter } from "lucide-react";
import type { DocumentMetadata } from "@/lib/types";
import { DocumentType } from "@/lib/types";
import { ShareDocumentDialog } from "./ShareDocumentDialog";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [filterHasGoogleDocsLink, setFilterHasGoogleDocsLink] = useState<"all" | "yes" | "no">("all");
  const [filterSharedEmail, setFilterSharedEmail] = useState("");
  const [filterNumber, setFilterNumber] = useState("");
  const [filterCreatedAt, setFilterCreatedAt] = useState<Date | undefined>(undefined);
  const [filterUpdatedAt, setFilterUpdatedAt] = useState<Date | undefined>(undefined);


  useEffect(() => {
    const filtered = initialDocuments.filter(doc => {
      const nameMatch = filterName === "" || doc.name.toLowerCase().includes(filterName.toLowerCase());
      const typeMatch = filterType === "all" || doc.type === filterType;
      const statusMatch = filterStatus === "all" || doc.status === filterStatus;
      const googleDocsMatch = filterHasGoogleDocsLink === "all" ||
                             (filterHasGoogleDocsLink === "yes" && !!doc.googleDocsId) ||
                             (filterHasGoogleDocsLink === "no" && !doc.googleDocsId);
      const sharedEmailMatch = filterSharedEmail === "" ||
                               (doc.sharedWith && doc.sharedWith.some(user => user.email.toLowerCase().includes(filterSharedEmail.toLowerCase())));
      const numberMatch = filterNumber === "" || doc.number.toLowerCase().includes(filterNumber.toLowerCase());
      const createdAtMatch = !filterCreatedAt || isSameDay(new Date(doc.createdAt), filterCreatedAt);
      const updatedAtMatch = !filterUpdatedAt || isSameDay(new Date(doc.updatedAt), filterUpdatedAt);

      return nameMatch && typeMatch && statusMatch && googleDocsMatch && sharedEmailMatch && numberMatch && createdAtMatch && updatedAtMatch;
    });

    const docsWithFormattedData = filtered.map(doc => ({
      ...doc,
      displayUpdatedAt: format(new Date(doc.updatedAt), "dd MMM, yyyy", { locale: ptBR }),
      displayStatus: doc.status === "Published" ? "Publicado" : doc.status === "Draft" ? "Rascunho" : doc.status,
    }));
    setDocumentsToDisplay(docsWithFormattedData);
  }, [initialDocuments, filterName, filterType, filterStatus, filterHasGoogleDocsLink, filterSharedEmail, filterNumber, filterCreatedAt, filterUpdatedAt]);

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
  
  const handleClearFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent accordion from toggling when clear button is clicked
    setFilterName("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterHasGoogleDocsLink("all");
    setFilterSharedEmail("");
    setFilterNumber("");
    setFilterCreatedAt(undefined);
    setFilterUpdatedAt(undefined);
  };

  if (documentsToDisplay === null && initialDocuments.length > 0) {
     return (
      <div className="rounded-lg border shadow-sm bg-card p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-muted rounded w-full mb-2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded w-full mb-1"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const currentDocuments = documentsToDisplay || [];

  return (
    <>
      <Accordion type="single" collapsible className="mb-6 bg-card border rounded-lg shadow-md" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
              </div>
              <Button variant="outline" onClick={handleClearFilters} size="sm">
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0"> {/* Adjusted padding here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end pt-2">
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
                <Label htmlFor="filterNumber" className="text-sm font-medium text-muted-foreground db-block mb-1">Número</Label>
                <Input
                  id="filterNumber"
                  placeholder="Buscar por número..."
                  value={filterNumber}
                  onChange={(e) => setFilterNumber(e.target.value)}
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
              <div>
                <Label htmlFor="filterCreatedAt" className="text-sm font-medium text-muted-foreground db-block mb-1">Data de Criação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !filterCreatedAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterCreatedAt ? format(filterCreatedAt, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterCreatedAt}
                      onSelect={setFilterCreatedAt}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="filterUpdatedAt" className="text-sm font-medium text-muted-foreground db-block mb-1">Data Últ. Modificação</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !filterUpdatedAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterUpdatedAt ? format(filterUpdatedAt, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterUpdatedAt}
                      onSelect={setFilterUpdatedAt}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="filterHasGoogleDocsLink" className="text-sm font-medium text-muted-foreground db-block mb-1">
                  <Link2 className="inline mr-1 h-4 w-4" />
                  Link Google Docs?
                </Label>
                <Select value={filterHasGoogleDocsLink} onValueChange={(value) => setFilterHasGoogleDocsLink(value as "all" | "yes" | "no")}>
                  <SelectTrigger id="filterHasGoogleDocsLink" className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="yes">Sim</SelectItem>
                    <SelectItem value="no">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterSharedEmail" className="text-sm font-medium text-muted-foreground db-block mb-1">
                  <Users className="inline mr-1 h-4 w-4" />
                  Compartilhado com
                </Label>
                <Input
                  id="filterSharedEmail"
                  placeholder="Buscar por e-mail..."
                  value={filterSharedEmail}
                  onChange={(e) => setFilterSharedEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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


    