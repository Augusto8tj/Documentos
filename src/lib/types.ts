
export enum DocumentType {
  OFICIO = "Ofício",
  MEMORANDO = "Memorando",
  PORTARIA = "Portaria",
  DECRETO = "Decreto",
  ATA = "Ata",
  OUTROS = "Outros",
}

export enum DocumentDepartment {
  ADMINISTRACAO = "Administração",
  GABINETE = "Gabinete",
  RECURSOS_HUMANOS = "Recursos Humanos",
  FINANCEIRO = "Financeiro",
  JURIDICO = "Jurídico",
  TI = "Tecnologia da Informação",
  COMUNICACAO = "Comunicação",
  OUTROS = "Outros",
}

export type DocumentSourceType = "internal" | "googleDocs" | "local";

export interface DocumentMetadata {
  id: string;
  name: string;
  type: DocumentType;
  number: string; // Automatic numbering will produce this
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: "Draft" | "Published" | "Archived";
  
  sourceType: DocumentSourceType;
  googleDocsId?: string; // ID of the document in Google Docs
  localFileIdentifier?: string; // User-defined path or identifier for local files
  internalContent?: string; // Conteúdo para documentos internos
  sharedWith?: { email: string; permission: "view" | "edit" }[];
  author?: { name: string; email: string };
  department?: DocumentDepartment; 
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  baseContentPreview: string; 
  defaultDocumentType: DocumentType;
}

export type UserRole = 'admin' | 'employee';

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: DocumentDepartment; // Admin (RH) also belongs to RH department for document creation
}
