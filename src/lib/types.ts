
export enum DocumentType {
  OFICIO = "Ofício",
  MEMORANDO = "Memorando",
  PORTARIA = "Portaria",
  DECRETO = "Decreto",
  ATA = "Ata",
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
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  baseContentPreview: string; // Short preview or instruction
  defaultDocumentType: DocumentType;
  // In a real scenario, baseContent might be more complex (e.g., HTML, Markdown, or an ID to a GDoc template)
}
