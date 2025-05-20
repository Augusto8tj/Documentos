
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
import { 
  format, 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  isSameYear, 
  startOfWeek, 
  endOfWeek 
} from "date-fns";
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

interface ProcessedDocument extends DocumentMetadata {
  displayUpdatedAt: string;
  displayStatus: string;
}

type DateFilterPeriod = "all" | "day" | "week" | "month" | "year";

export function DocumentListClient({ documents: initialDocuments }: DocumentListClientProps) {
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[] | null>(null);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<DocumentMetadata | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DocumentMetadata["status"] | "all">("all");
  
  const [filterCreatedAtPeriod, setFilterCreatedAtPeriod] = useState<DateFilterPeriod>("all");
  const [filterCreatedAtValue, setFilterCreatedAtValue] = useState<Date | undefined>(undefined);
  
  const [filterUpdatedAtPeriod, setFilterUpdatedAtPeriod] = useState<DateFilterPeriod>("all");
  const [filterUpdatedAtValue, setFilterUpdatedAtValue] = useState<Date | undefined>(undefined);

  const [filterHasGoogleDocsLink, setFilterHasGoogleDocsLink] = useState<"all" | "yes" | "no">("all");
  const [filterSharedEmail, setFilterSharedEmail] = useState("");

  useEffect(() => {
    const formattedInitialDocs = initialDocuments.map(doc => ({
      ...doc,
      displayUpdatedAt: format(new Date(doc.updatedAt), "dd MMM, yyyy", { locale: ptBR }),
      displayStatus: doc.status === "Published" ? "Publicado" : doc.status === "Draft" ? "Rascunho" : doc.status,
    }));

    const filtered = formattedInitialDocs.filter(doc => {
      const searchTermMatch = filterSearchTerm === "" || 
                              doc.name.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
                              doc.number.toLowerCase().includes(filterSearchTerm.toLowerCase());
      const typeMatch = filterType === "all" || doc.type === filterType;
      const statusMatch = filterStatus === "all" || doc.status === filterStatus;
      
      let createdAtMatch = true;
      if (filterCreatedAtPeriod !== 'all' && filterCreatedAtValue) {
        const docCreatedAt = new Date(doc.createdAt);
        if (filterCreatedAtPeriod === 'day') {
          createdAtMatch = isSameDay(docCreatedAt, filterCreatedAtValue);
        } else if (filterCreatedAtPeriod === 'week') {
          createdAtMatch = isSameWeek(docCreatedAt, filterCreatedAtValue, { locale: ptBR });
        } else if (filterCreatedAtPeriod === 'month') {
          createdAtMatch = isSameMonth(docCreatedAt, filterCreatedAtValue);
        } else if (filterCreatedAtPeriod === 'year') {
          createdAtMatch = isSameYear(docCreatedAt, filterCreatedAtValue);
        }
      }

      let updatedAtMatch = true;
      if (filterUpdatedAtPeriod !== 'all' && filterUpdatedAtValue) {
        const docUpdatedAt = new Date(doc.updatedAt);
        if (filterUpdatedAtPeriod === 'day') {
          updatedAtMatch = isSameDay(docUpdatedAt, filterUpdatedAtValue);
        } else if (filterUpdatedAtPeriod === 'week') {
          updatedAtMatch = isSameWeek(docUpdatedAt, filterUpdatedAtValue, { locale: ptBR });
        } else if (filterUpdatedAtPeriod === 'month') {
          updatedAtMatch = isSameMonth(docUpdatedAt, filterUpdatedAtValue);
        } else if (filterUpdatedAtPeriod === 'year') {
          updatedAtMatch = isSameYear(docUpdatedAt, filterUpdatedAtValue);
        }
      }

      const googleDocsMatch = filterHasGoogleDocsLink === "all" ||
                             (filterHasGoogleDocsLink === "yes" && !!doc.googleDocsId) ||
                             (filterHasGoogleDocsLink === "no" && !doc.googleDocsId);
      const sharedEmailMatch = filterSharedEmail === "" ||
                               (doc.sharedWith && doc.sharedWith.some(user => user.email.toLowerCase().includes(filterSharedEmail.toLowerCase())));
      
      return searchTermMatch && typeMatch && statusMatch && createdAtMatch && updatedAtMatch && googleDocsMatch && sharedEmailMatch;
    });
    
    setProcessedDocs(filtered);

  }, [initialDocuments, filterSearchTerm, filterType, filterStatus, 
      filterCreatedAtPeriod, filterCreatedAtValue, 
      filterUpdatedAtPeriod, filterUpdatedAtValue,
      filterHasGoogleDocsLink, filterSharedEmail]);

  const handleShare = (doc: DocumentMetadata) => {
    setSelectedDocumentForShare(doc);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (docId: string) => {
    console.log("Excluir documento:", docId);
    // Here you would typically call a server action to delete the document
    // For now, just remove from client-side state for demo
    setProcessedDocs(prevDocs => prevDocs ? prevDocs.filter(doc => doc.id !== docId) : null);
  };
  
  const handleClearFilters = () => {
    setFilterSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterCreatedAtPeriod("all");
    setFilterCreatedAtValue(undefined);
    setFilterUpdatedAtPeriod("all");
    setFilterUpdatedAtValue(undefined);
    setFilterHasGoogleDocsLink("all");
    setFilterSharedEmail("");
  };

  const handleCreatedAtPeriodChange = (newPeriod: DateFilterPeriod) => {
    setFilterCreatedAtPeriod(newPeriod);
    setFilterCreatedAtValue(undefined); // Reset date value when period changes
  };

  const handleUpdatedAtPeriodChange = (newPeriod: DateFilterPeriod) => {
    setFilterUpdatedAtPeriod(newPeriod);
    setFilterUpdatedAtValue(undefined); // Reset date value when period changes
  };
  
  const formatFilterDateButtonText = (period: DateFilterPeriod, value: Date | undefined): string => {
    if (period === 'all' || !value) {
      return "Escolha uma data";
    }
    switch (period) {
      case 'day':
        return format(value, "dd/MM/yyyy", { locale: ptBR });
      case 'week':
        const startW = startOfWeek(value, { locale: ptBR });
        const endW = endOfWeek(value, { locale: ptBR });
        return `Sem: ${format(startW, "dd/MM", { locale: ptBR })} - ${format(endW, "dd/MM/yy", { locale: ptBR })}`;
      case 'month':
        return format(value, "MMMM yyyy", { locale: ptBR });
      case 'year':
        return format(value, "yyyy", { locale: ptBR });
      default:
        return "Escolha uma data";
    }
  };


   if (processedDocs === null && initialDocuments.length > 0) {
     // Show a more structured skeleton while initial processing/filtering happens
     return (
      <div className="rounded-lg border shadow-sm bg-card p-4">
        <div className="animate-pulse">
          {/* Skeleton for filter section header */}
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          {/* Skeleton for filter controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 items-end">
            {[...Array(7)].map((_, i) => ( // Assuming roughly 7 filter controls
              <div key={i} className="space-y-1">
                <div className="h-4 bg-muted rounded w-1/3"></div> {/* Label skeleton */}
                <div className="h-10 bg-muted rounded"></div> {/* Input/Select skeleton */}
              </div>
            ))}
          </div>
          {/* Skeleton for table header */}
          <div className="h-10 bg-muted rounded w-full mb-2"></div>
          {/* Skeleton for table rows */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded w-full mb-1"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const currentDocuments = processedDocs || [];

  return (
    <>
      <Accordion type="single" collapsible className="mb-6 bg-card border rounded-lg shadow-md" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <div className="flex items-center justify-between p-4">
             <AccordionTrigger className="p-0 hover:no-underline flex-grow text-left">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
              </div>
            </AccordionTrigger>
            <Button variant="outline" onClick={handleClearFilters} size="sm" className="ml-4 flex-shrink-0">
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
          <AccordionContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 items-start pt-2">
              <div>
                <Label htmlFor="filterSearchTerm" className="text-sm font-medium text-muted-foreground db-block mb-1">Pesquisar Nome/Número</Label>
                <Input
                  id="filterSearchTerm"
                  placeholder="Digite nome ou número..."
                  value={filterSearchTerm}
                  onChange={(e) => setFilterSearchTerm(e.target.value)}
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
              
              {/* Created At Filter */}
              <div className="space-y-1">
                <Label htmlFor="filterCreatedAtPeriodSelect" className="text-sm font-medium text-muted-foreground">Data de Criação</Label>
                <div className="flex gap-2 mt-1">
                  <Select 
                    value={filterCreatedAtPeriod} 
                    onValueChange={(value) => handleCreatedAtPeriodChange(value as DateFilterPeriod)}
                    name="filterCreatedAtPeriodSelect" // Added name for accessibility/testing
                    aria-label="Período do filtro de data de criação" // Added aria-label
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="day">Dia</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled={filterCreatedAtPeriod === 'all'}
                        className={cn(
                          "flex-grow justify-start text-left font-normal",
                          !filterCreatedAtValue && filterCreatedAtPeriod !== 'all' && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatFilterDateButtonText(filterCreatedAtPeriod, filterCreatedAtValue)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterCreatedAtValue}
                        onSelect={setFilterCreatedAtValue}
                        initialFocus
                        locale={ptBR}
                        disabled={filterCreatedAtPeriod === 'all'} // Disable if "all" is selected
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Updated At Filter */}
              <div className="space-y-1">
                <Label htmlFor="filterUpdatedAtPeriodSelect" className="text-sm font-medium text-muted-foreground">Data Últ. Modificação</Label>
                 <div className="flex gap-2 mt-1">
                  <Select 
                    value={filterUpdatedAtPeriod} 
                    onValueChange={(value) => handleUpdatedAtPeriodChange(value as DateFilterPeriod)}
                    name="filterUpdatedAtPeriodSelect" // Added name
                    aria-label="Período do filtro de data de última modificação" // Added aria-label
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="day">Dia</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled={filterUpdatedAtPeriod === 'all'}
                        className={cn(
                          "flex-grow justify-start text-left font-normal",
                          !filterUpdatedAtValue && filterUpdatedAtPeriod !== 'all' && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatFilterDateButtonText(filterUpdatedAtPeriod, filterUpdatedAtValue)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterUpdatedAtValue}
                        onSelect={setFilterUpdatedAtValue}
                        initialFocus
                        locale={ptBR}
                        disabled={filterUpdatedAtPeriod === 'all'} // Disable if "all" is selected
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
