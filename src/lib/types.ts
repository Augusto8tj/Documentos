
export enum DocumentType {
  OFICIO = "Ofício",
  MEMORANDO = "Memorando",
  PORTARIA = "Portaria",
  DECRETO = "Decreto",
  ATA = "Ata",
  OUTROS = "Outros",
}

export interface DocumentMetadata {
  id: string;
  name: string;
  type: DocumentType;
  number: string; // Automatic numbering will produce this
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  googleDocsId?: string; // ID of the document in Google Docs
  sharedWith?: { email: string; permission: "view" | "edit" }[];
  status: "Draft" | "Published" | "Archived";
}
