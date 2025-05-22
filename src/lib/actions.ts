
"use server";

import { z } from "zod";
import type { DocumentMetadata, DocumentSourceType } from "./types";
import { 
  addDocument as dbAddDocument, 
  updateDocumentSharing as dbUpdateDocumentSharing, 
  updateDocumentMetadata as dbUpdateDocumentMetadata,
  userDocuments 
} from "@/data/mock-data";
import { revalidatePath } from "next/cache";

const CreateDocumentSchema = z.object({
  name: z.string().min(3, "O nome do documento deve ter pelo menos 3 caracteres."),
  type: z.string().min(1, "Por favor, selecione um tipo de documento."),
  department: z.string().min(1, "Por favor, selecione um departamento."),
  sourceType: z.enum(["internal", "googleDocs", "local"]),
  googleDocsId: z.string().optional(),
  localFileIdentifier: z.string().optional(),
  internalContent: z.string().optional(),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
}).refine(data => {
  if (data.sourceType === "local" && (!data.localFileIdentifier || data.localFileIdentifier.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O identificador do arquivo local é obrigatório se a fonte for 'Arquivo Local'.",
  path: ["localFileIdentifier"],
}).refine(data => {
  if (data.sourceType === "googleDocs" && (!data.googleDocsId || data.googleDocsId.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O ID do Google Docs é obrigatório se a fonte for 'Google Docs'.",
  path: ["googleDocsId"],
});

export async function createDocumentAction(formData: FormData) {
  const rawFormData = {
    name: formData.get("name") || undefined,
    type: formData.get("type") || undefined,
    department: formData.get("department") || undefined,
    sourceType: formData.get("sourceType") || undefined,
    googleDocsId: formData.get("googleDocsId") || undefined,
    localFileIdentifier: formData.get("localFileIdentifier") || undefined,
    internalContent: formData.get("internalContent") || undefined,
    authorName: formData.get("authorName") || undefined,
    authorEmail: formData.get("authorEmail") || undefined,
  };

  const validatedFields = CreateDocumentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Dados inválidos. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { 
    name, 
    type, 
    department,
    sourceType, 
    googleDocsId, 
    localFileIdentifier, 
    internalContent,
    authorName,
    authorEmail 
  } = validatedFields.data;

  // Numbering should be unique across all documents for simplicity in mock data
  const countForAllDocs = userDocuments.length + 1;
  const typePrefix = type.substring(0, Math.min(type.length, 3)).toUpperCase();
  const paddedCount = countForAllDocs.toString().padStart(3, '0');
  const newNumber = `${typePrefix}-${new Date().getFullYear()}-${paddedCount}`;

  const newDocument: DocumentMetadata = {
    id: crypto.randomUUID(),
    name,
    type,
    department,
    number: newNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Draft",
    sourceType: sourceType as DocumentSourceType,
    sharedWith: [],
  };

  if (authorName && authorEmail) {
    newDocument.author = { name: authorName, email: authorEmail };
  }

  if (sourceType === "googleDocs" && googleDocsId) {
    newDocument.googleDocsId = googleDocsId;
  } else if (sourceType === "local" && localFileIdentifier) {
    newDocument.localFileIdentifier = localFileIdentifier;
  } else if (sourceType === "internal" && internalContent !== undefined) { // Check for undefined
    newDocument.internalContent = internalContent;
  }


  dbAddDocument(newDocument);
  
  revalidatePath("/"); 
  revalidatePath("/documents/create"); 
  revalidatePath(`/documents/${newDocument.id}`);


  return { success: true, documentId: newDocument.id };
}


const ShareDocumentSchema = z.object({
  documentId: z.string(),
  sharedWith: z.array(z.object({
    email: z.string().email("Formato de e-mail inválido."),
    permission: z.enum(["view", "edit"]),
  })).optional(),
});

export async function shareDocumentAction(documentId: string, sharedWithInput: DocumentMetadata['sharedWith']) {
  const validatedFields = ShareDocumentSchema.safeParse({
    documentId,
    sharedWith: sharedWithInput || [],
  });

  if (!validatedFields.success) {
    return {
      error: "Dados de compartilhamento inválidos. Verifique os e-mails e permissões.",
    };
  }
  
  const { sharedWith } = validatedFields.data;

  dbUpdateDocumentSharing(validatedFields.data.documentId, sharedWith);

  revalidatePath("/");
  revalidatePath(`/documents/${documentId}`); 

  return { success: true };
}

const EditDocumentFormSchema = z.object({
  id: z.string().min(1, "ID do documento é obrigatório."),
  name: z.string().min(3, "O nome do documento deve ter pelo menos 3 caracteres."),
  type: z.string().min(1, "Por favor, selecione um tipo de documento válido."),
  department: z.string().min(1, "Por favor, selecione um departamento."),
  sourceType: z.enum(["internal", "googleDocs", "local"]),
  googleDocsId: z.string().optional(),
  localFileIdentifier: z.string().optional(),
  internalContent: z.string().optional(),
}).refine(data => {
  if (data.sourceType === "local" && (!data.localFileIdentifier || data.localFileIdentifier.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O identificador do arquivo local é obrigatório se a fonte for 'Arquivo Local'.",
  path: ["localFileIdentifier"],
}).refine(data => {
  if (data.sourceType === "googleDocs" && (!data.googleDocsId || data.googleDocsId.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O ID do Google Docs é obrigatório se a fonte for 'Google Docs'.",
  path: ["googleDocsId"],
});

export async function updateDocumentAction(formData: FormData) {
  const rawFormData = {
    id: formData.get("id") || undefined,
    name: formData.get("name") || undefined,
    type: formData.get("type") || undefined,
    department: formData.get("department") || undefined,
    sourceType: formData.get("sourceType") || undefined,
    googleDocsId: formData.get("googleDocsId") || undefined,
    localFileIdentifier: formData.get("localFileIdentifier") || undefined,
    internalContent: formData.get("internalContent") || undefined, // Ensure it's read, can be empty string
  };
  const validatedFields = EditDocumentFormSchema.safeParse(rawFormData);


  if (!validatedFields.success) {
    return {
      error: "Dados inválidos. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { id, name, type, department, sourceType, googleDocsId, localFileIdentifier, internalContent } = validatedFields.data;

  if (!department) {
     return { error: "Departamento é obrigatório." };
  }

  const updates: Partial<DocumentMetadata> = { name, type, department, sourceType: sourceType as DocumentSourceType };

  if (sourceType === "googleDocs") {
    updates.googleDocsId = googleDocsId || ""; // Default to empty string if null/undefined
    updates.localFileIdentifier = undefined; 
    updates.internalContent = undefined;
  } else if (sourceType === "local") {
    updates.localFileIdentifier = localFileIdentifier || ""; // Default to empty string
    updates.googleDocsId = undefined; 
    updates.internalContent = undefined;
  } else if (sourceType === "internal") { 
    updates.googleDocsId = undefined;
    updates.localFileIdentifier = undefined;
    updates.internalContent = internalContent; // Can be empty string or content
  } else { 
    updates.googleDocsId = undefined;
    updates.localFileIdentifier = undefined;
    updates.internalContent = undefined;
  }

  const success = dbUpdateDocumentMetadata(id, updates);

  if (!success) {
    return {
      error: "Documento não encontrado ou falha ao atualizar.",
    };
  }

  revalidatePath("/"); 
  revalidatePath(`/documents/${id}`);
  revalidatePath(`/documents/${id}/edit`);

  return { success: true, documentId: id };
}

