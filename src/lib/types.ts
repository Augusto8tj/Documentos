
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
  sharedWith?: { email: string; permission: "view" | "edit" }[];
}
