
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
import { Edit3, Share2, Trash2, MoreVertical, FileText, Eye, X, ExternalLink, Users, CalendarIcon, Filter, Folder, FileArchive, CheckCircle2, FileEdit, Archive, User, Building, Loader2, ChevronDown } from "lucide-react";
import type { DocumentMetadata, DocumentSourceType, DocumentTypeValue, DocumentDepartmentValue } from "@/lib/types";
import { ADMIN_DEPARTMENT, DEFAULT_DOCUMENT_TYPES, DEFAULT_DOCUMENT_DEPARTMENTS } from "@/lib/types";
import { ShareDocumentDialog } from "./ShareDocumentDialog";
import { updateDocumentStatusAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";


interface DocumentListClientProps {
  documents: DocumentMetadata[];
}

interface ProcessedDocument extends DocumentMetadata {
  displayUpdatedAt: string;
  displayStatus: string;
}

type DateFilterPeriod = "all" | "day" | "week" | "month" | "year";
const localStorageDocumentTypesKey = "docflow-document-types";
const localStorageDepartmentsKey = "docflow-document-departments";

const STATUS_OPTIONS: DocumentMetadata["status"][] = ["Published", "Draft", "Archived"];
const STATUS_LABELS: Record<DocumentMetadata["status"], string> = {
  Published: "Publicado",
  Draft: "Rascunho",
  Archived: "Arquivado",
};


export function DocumentListClient({ documents: initialDocuments }: DocumentListClientProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[] | null>(null);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<DocumentMetadata | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});


  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DocumentTypeValue | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DocumentMetadata["status"] | "all">("all");
  const [filterDepartment, setFilterDepartment] = useState<DocumentDepartmentValue | "all">("all");
  
  const [filterCreatedAtPeriod, setFilterCreatedAtPeriod] = useState<DateFilterPeriod>("all");
  const [filterCreatedAtValue, setFilterCreatedAtValue] = useState<Date | undefined>(undefined);
  
  const [filterUpdatedAtPeriod, setFilterUpdatedAtPeriod] = useState<DateFilterPeriod>("all");
  const [filterUpdatedAtValue, setFilterUpdatedAtValue] = useState<Date | undefined>(undefined);

  const [filterSourceType, setFilterSourceType] = useState<DocumentSourceType | "all">("all");
  const [filterSharedEmail, setFilterSharedEmail] = useState("");
  const [filterAuthorEmail, setFilterAuthorEmail] = useState("");

  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentTypeValue[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<DocumentDepartmentValue[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  useEffect(() => {
    setIsLoadingFilters(true);
    try {
      const storedTypes = localStorage.getItem(localStorageDocumentTypesKey);
      setAvailableDocumentTypes(storedTypes ? JSON.parse(storedTypes) : DEFAULT_DOCUMENT_TYPES);

      const storedDepartments = localStorage.getItem(localStorageDepartmentsKey);
      setAvailableDepartments(storedDepartments ? JSON.parse(storedDepartments) : DEFAULT_DOCUMENT_DEPARTMENTS);
    } catch (error) {
      console.error("Erro ao carregar configurações de filtro do localStorage:", error);
      setAvailableDocumentTypes(DEFAULT_DOCUMENT_TYPES);
      setAvailableDepartments(DEFAULT_DOCUMENT_DEPARTMENTS);
    }
    setIsLoadingFilters(false);
  }, []);


  useEffect(() => {
    if (authIsLoading || !user || isLoadingFilters) {
      setProcessedDocs(isLoadingFilters ? null : []); 
      return;
    }

    const userIsAdmin = (user.departments || []).includes(ADMIN_DEPARTMENT);

    const documentsForUser = initialDocuments.filter(doc => {
      if (userIsAdmin) return true;
      return doc.department && (user.departments || []).includes(doc.department);
    });

    const formattedDocs = documentsForUser.map(doc => ({
      ...doc,
      displayUpdatedAt: format(new Date(doc.updatedAt), "dd MMM, yyyy", { locale: ptBR }),
      displayStatus: STATUS_LABELS[doc.status] || doc.status,
    }));

    const filtered = formattedDocs.filter(doc => {
      const searchTermMatch = filterSearchTerm === "" || 
                              doc.name.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
                              doc.number.toLowerCase().includes(filterSearchTerm.toLowerCase());
      const typeMatch = filterType === "all" || doc.type === filterType;
      const statusMatch = filterStatus === "all" || doc.status === filterStatus;
      const departmentMatch = filterDepartment === "all" || doc.department === filterDepartment;
      const sourceTypeMatch = filterSourceType === "all" || doc.sourceType === filterSourceType;
      
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

      const sharedEmailMatch = filterSharedEmail === "" ||
                               (doc.sharedWith && doc.sharedWith.some(u => u.email.toLowerCase().includes(filterSharedEmail.toLowerCase())));

      const authorEmailMatch = filterAuthorEmail === "" ||
                               (doc.author && doc.author.email.toLowerCase().includes(filterAuthorEmail.toLowerCase()));
      
      return searchTermMatch && typeMatch && statusMatch && departmentMatch && createdAtMatch && updatedAtMatch && sourceTypeMatch && sharedEmailMatch && authorEmailMatch;
    });
    
    setProcessedDocs(filtered);

  }, [initialDocuments, filterSearchTerm, filterType, filterStatus, filterDepartment,
      filterCreatedAtPeriod, filterCreatedAtValue, 
      filterUpdatedAtPeriod, filterUpdatedAtValue,
      filterSourceType, filterSharedEmail, filterAuthorEmail, user, authIsLoading, isLoadingFilters]);

  const handleShare = (doc: DocumentMetadata) => {
    setSelectedDocumentForShare(doc);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (docId: string) => {
    // TODO: Implement actual delete action with server call
    console.log("Excluir documento:", docId); // Simulação
    setProcessedDocs(prevDocs => prevDocs ? prevDocs.filter(doc => doc.id !== docId) : null);
    toast({ title: "Documento Excluído (Simulado)", description: "A exclusão real requer integração com backend."})
  };

  const handleStatusChange = async (documentId: string, newStatus: DocumentMetadata["status"]) => {
    setIsUpdatingStatus(prev => ({ ...prev, [documentId]: true }));
    const originalDocument = processedDocs?.find(doc => doc.id === documentId);
    if (!originalDocument) return;

    // Optimistically update UI
    setProcessedDocs(prevDocs =>
      prevDocs 
        ? prevDocs.map(d => 
            d.id === documentId ? { ...d, status: newStatus, displayStatus: STATUS_LABELS[newStatus] } : d
          )
        : null
    );

    try {
      const result = await updateDocumentStatusAction(documentId, newStatus);
      if (result.success) {
        toast({
          title: "Status Atualizado",
          description: `O status do documento foi alterado para ${STATUS_LABELS[newStatus]}.`,
        });
      } else {
        toast({
          title: "Erro ao Atualizar Status",
          description: result.error || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
        // Revert optimistic update
        setProcessedDocs(prevDocs =>
          prevDocs
            ? prevDocs.map(d => 
                d.id === documentId ? { ...originalDocument, displayStatus: STATUS_LABELS[originalDocument.status] } : d
              )
            : null
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro de Rede",
        description: "Não foi possível conectar ao servidor para atualizar o status.",
        variant: "destructive",
      });
       // Revert optimistic update
       setProcessedDocs(prevDocs =>
        prevDocs
          ? prevDocs.map(d => 
              d.id === documentId ? { ...originalDocument, displayStatus: STATUS_LABELS[originalDocument.status] } : d
            )
          : null
      );
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [documentId]: false }));
    }
  };
  
  const handleClearFilters = () => {
    setFilterSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterDepartment("all");
    setFilterCreatedAtPeriod("all");
    setFilterCreatedAtValue(undefined);
    setFilterUpdatedAtPeriod("all");
    setFilterUpdatedAtValue(undefined);
    setFilterSourceType("all");
    setFilterSharedEmail("");
    setFilterAuthorEmail("");
  };

  const handleCreatedAtPeriodChange = (newPeriod: DateFilterPeriod) => {
    setFilterCreatedAtPeriod(newPeriod);
    setFilterCreatedAtValue(undefined); 
  };

  const handleUpdatedAtPeriodChange = (newPeriod: DateFilterPeriod) => {
    setFilterUpdatedAtPeriod(newPeriod);
    setFilterUpdatedAtValue(undefined); 
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

  if (authIsLoading || processedDocs === null || isLoadingFilters) {
     return (
      <div className="rounded-lg border shadow-sm bg-card p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 items-end">
            {[...Array(9)].map((_, i) => ( 
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
  
  const currentDocuments = processedDocs; 
  const userIsAdmin = user && (user.departments || []).includes(ADMIN_DEPARTMENT);

  const getSourceTypeIcon = (sourceType: DocumentSourceType) => {
    switch (sourceType) {
      case "googleDocs":
        return <ExternalLink className="h-4 w-4 text-blue-500" />;
      case "local":
        return <Folder className="h-4 w-4 text-orange-500" />;
      case "internal":
        return <FileArchive className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />; 
    }
  };
  
  const getStatusBadgeVariant = (status: DocumentMetadata["status"]) => {
    switch (status) {
      case "Published":
        return "default"; 
      case "Draft":
        return "secondary";
      case "Archived":
        return "outline"; 
      default:
        return "secondary";
    }
  };

  const getStatusBadgeClass = (status: DocumentMetadata["status"]) => {
     switch (status) {
      case "Published":
        return "bg-accent text-accent-foreground hover:bg-accent/80"; 
      case "Draft":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/50 hover:bg-yellow-500/30"; 
      case "Archived":
         return "bg-gray-500/20 text-gray-700 border-gray-500/50 hover:bg-gray-500/30"; 
      default:
        return "";
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <FileArchive className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">Por favor, faça login para visualizar e gerenciar documentos.</p>
        <Button asChild>
          <Link href="/login">Ir para Login</Link>
        </Button>
      </div>
    );
  }


  return (
    <>
      <Accordion type="single" collapsible className="mb-6 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-lg shadow-md">
        <AccordionItem value="item-1" className="border-b-0">
          <div className="flex items-center justify-between p-4">
            <AccordionTrigger className="flex-grow text-left text-xl font-bold text-primary hover:no-underline p-0">
              <div className="flex items-center gap-2">
                <Filter className="h-6 w-6 text-primary" />
                Filtros
              </div>
            </AccordionTrigger>
            <Button variant="ghost" onClick={handleClearFilters} size="sm" className="ml-4 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/30">
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
                <Select value={filterType} onValueChange={(value) => setFilterType(value as DocumentTypeValue | "all")}>
                  <SelectTrigger id="filterType" className="mt-1">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {availableDocumentTypes.map((type) => (
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
                    <SelectItem value="Draft">{STATUS_LABELS["Draft"]}</SelectItem>
                    <SelectItem value="Published">{STATUS_LABELS["Published"]}</SelectItem>
                    <SelectItem value="Archived">{STATUS_LABELS["Archived"]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userIsAdmin && (
                <div>
                  <Label htmlFor="filterDepartment" className="text-sm font-medium text-muted-foreground db-block mb-1">Departamento</Label>
                  <Select value={filterDepartment} onValueChange={(value) => setFilterDepartment(value as DocumentDepartmentValue | "all")}>
                    <SelectTrigger id="filterDepartment" className="mt-1">
                      <SelectValue placeholder="Todos os departamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os departamentos</SelectItem>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="filterSourceType" className="text-sm font-medium text-muted-foreground db-block mb-1">Fonte do Documento</Label>
                <Select value={filterSourceType} onValueChange={(value) => setFilterSourceType(value as DocumentSourceType | "all")}>
                  <SelectTrigger id="filterSourceType" className="mt-1">
                    <SelectValue placeholder="Todas as fontes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as fontes</SelectItem>
                    <SelectItem value="internal">Interno</SelectItem>
                    <SelectItem value="googleDocs">Google Docs</SelectItem>
                    <SelectItem value="local">Arquivo Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="filterCreatedAtPeriodSelect" className="text-sm font-medium text-muted-foreground">Data de Criação</Label>
                <div className="flex gap-2 mt-1">
                  <Select 
                    value={filterCreatedAtPeriod} 
                    onValueChange={(value) => handleCreatedAtPeriodChange(value as DateFilterPeriod)}
                    name="filterCreatedAtPeriodSelect" 
                    aria-label="Período do filtro de data de criação"
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
                        disabled={filterCreatedAtPeriod === 'all'}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="filterUpdatedAtPeriodSelect" className="text-sm font-medium text-muted-foreground">Data Últ. Modificação</Label>
                 <div className="flex gap-2 mt-1">
                  <Select 
                    value={filterUpdatedAtPeriod} 
                    onValueChange={(value) => handleUpdatedAtPeriodChange(value as DateFilterPeriod)}
                    name="filterUpdatedAtPeriodSelect" 
                    aria-label="Período do filtro de data de última modificação" 
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
                        disabled={filterUpdatedAtPeriod === 'all'} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="filterSharedEmail" className="text-sm font-medium text-muted-foreground db-block mb-1">
                  <Users className="inline mr-1 h-4 w-4" />
                  Compartilhado com (e-mail)
                </Label>
                <Input
                  id="filterSharedEmail"
                  placeholder="Buscar por e-mail..."
                  value={filterSharedEmail}
                  onChange={(e) => setFilterSharedEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              {userIsAdmin && (
                <div>
                  <Label htmlFor="filterAuthorEmail" className="text-sm font-medium text-muted-foreground db-block mb-1">
                    <User className="inline mr-1 h-4 w-4" />
                    Autor (e-mail)
                  </Label>
                  <Input
                    id="filterAuthorEmail"
                    placeholder="Buscar por e-mail do autor..."
                    value={filterAuthorEmail}
                    onChange={(e) => setFilterAuthorEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] p-2 text-center">Fonte</TableHead>
              <TableHead className="min-w-[250px]">Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              {userIsAdmin && <TableHead>Departamento</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userIsAdmin ? 8 : 7} className="h-24 text-center text-muted-foreground">
                  Nenhum documento encontrado com os filtros aplicados ou para seu departamento.
                </TableCell>
              </TableRow>
            ) : (
              currentDocuments.map((doc) => {
                const userCanEditDoc = userIsAdmin || (doc.department && (user?.departments || []).includes(doc.department));
                const isLoadingThisStatus = isUpdatingStatus[doc.id];

                return (
                <TableRow key={doc.id}>
                  <TableCell className="p-2 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{getSourceTypeIcon(doc.sourceType)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doc.sourceType === "googleDocs" ? "Google Docs" : doc.sourceType === "local" ? "Arquivo Local" : "Interno"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <Link href={`/documents/${doc.id}`} className="hover:underline truncate" title={doc.name}>
                         {doc.name}
                      </Link>
                      {doc.sharedWith && doc.sharedWith.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Compartilhado</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.number}</TableCell>
                  {userIsAdmin && <TableCell className="text-muted-foreground">{doc.department || "N/A"}</TableCell>}
                  <TableCell>
                    {userCanEditDoc ? (
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-auto px-2 py-1 flex items-center gap-1", getStatusBadgeClass(doc.status))}
                            disabled={isLoadingThisStatus}
                          >
                            {isLoadingThisStatus && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                            {doc.displayStatus}
                            {!isLoadingThisStatus && <ChevronDown className="h-3 w-3 opacity-70 ml-1" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {STATUS_OPTIONS.map(statusOption => (
                            <DropdownMenuItem
                              key={statusOption}
                              onClick={() => handleStatusChange(doc.id, statusOption)}
                              disabled={doc.status === statusOption}
                            >
                              {STATUS_LABELS[statusOption]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge 
                        variant={getStatusBadgeVariant(doc.status)} 
                        className={cn(getStatusBadgeClass(doc.status))}
                      >
                        {doc.displayStatus}
                      </Badge>
                    )}
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
                           <Link href={`/documents/${doc.id}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </Link>
                        </DropdownMenuItem>
                        {userCanEditDoc && (
                          <DropdownMenuItem asChild>
                            <Link href={`/documents/${doc.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          </DropdownMenuItem>
                        )}
                         {doc.sourceType === "googleDocs" && doc.googleDocsId && (
                          <DropdownMenuItem asChild>
                            <a href={`https://docs.google.com/document/d/${doc.googleDocsId}/edit`} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                              <ExternalLink className="mr-2 h-4 w-4" /> Abrir no Google Docs
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleShare(doc)} className="flex items-center cursor-pointer">
                          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                        </DropdownMenuItem>
                        {userIsAdmin && ( 
                           <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive flex items-center cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                )
            })
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
