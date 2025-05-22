
export type DocumentTypeValue = string;
export type DocumentDepartmentValue = string;

export const DEFAULT_DOCUMENT_TYPES: DocumentTypeValue[] = ["Ofício", "Memorando", "Portaria", "Decreto", "Ata", "Outros"];
export const DEFAULT_DOCUMENT_DEPARTMENTS: DocumentDepartmentValue[] = ["Administração", "Gabinete", "Recursos Humanos", "Financeiro", "Jurídico", "Tecnologia da Informação", "Comunicação", "Outros Setores"];
export const ADMIN_DEPARTMENT: DocumentDepartmentValue = "Recursos Humanos";


export const UserRole = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const;

export type UserRoleValue = typeof UserRole[keyof typeof UserRole];

export interface DocumentMetadata {
  id: string;
  name: string;
  type: DocumentTypeValue;
  number: string; 
  createdAt: string; 
  updatedAt: string; 
  status: "Draft" | "Published" | "Archived";
  
  sourceType: DocumentSourceType;
  googleDocsId?: string; 
  localFileIdentifier?: string; 
  internalContent?: string; 
  sharedWith?: { email: string; permission: "view" | "edit" }[];
  author?: { name: string; email: string };
  department?: DocumentDepartmentValue; 
  templateUsed?: string;
  templateContentPreview?: string;
}

export type DocumentSourceType = "internal" | "googleDocs" | "local";

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  baseContentPreview: string; 
  defaultDocumentType: DocumentTypeValue;
}

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleValue;
  departments: DocumentDepartmentValue[];
  password?: string; // Senha para simulação
}
