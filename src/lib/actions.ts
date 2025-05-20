
"use server";

import { z } from "zod";
import { DocumentType, type DocumentMetadata } from "./types";
import { addDocument as dbAddDocument, updateDocumentSharing as dbUpdateDocumentSharing, userDocuments } from "@/data/mock-data";
import { revalidatePath } from "next/cache";

const CreateDocumentSchema = z.object({
  name: z.string().min(3, "O nome do documento deve ter pelo menos 3 caracteres"),
  type: z.nativeEnum(DocumentType),
  // content: z.string().optional(), // If initial content is captured
});

export async function createDocumentAction(formData: FormData) {
  const validatedFields = CreateDocumentSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      error: "Dados inválidos. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { name, type } = validatedFields.data;

  // Simulate automatic numbering
  const typePrefix = type.substring(0, 3).toUpperCase();
  const countForType = userDocuments.filter(doc => doc.type === type).length + 1;
  const paddedCount = countForType.toString().padStart(3, '0');
  const newNumber = `${typePrefix}-${new Date().getFullYear()}-${paddedCount}`;

  const newDocument: DocumentMetadata = {
    id: crypto.randomUUID(),
    name,
    type,
    number: newNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Draft",
    sharedWith: [],
  };

  // Simulate Google Docs creation - in a real app, this would call Google Docs API
  // For now, we just add it to our mock data
  dbAddDocument(newDocument);
  
  // console.log("Simulated Google Doc creation for:", newDocument.name);

  revalidatePath("/"); // Revalidate dashboard
  revalidatePath("/documents/create"); // Potentially clear form or redirect

  return { success: true, documentId: newDocument.id };
}


const ShareDocumentSchema = z.object({
  documentId: z.string(),
  sharedWith: z.array(z.object({
    email: z.string().email("Formato de e-mail inválido."),
    permission: z.enum(["view", "edit"]),
  })).optional(), // Made optional to allow empty array for removing all users
});

export async function shareDocumentAction(documentId: string, sharedWithInput: DocumentMetadata['sharedWith']) {
  const validatedFields = ShareDocumentSchema.safeParse({
    documentId,
    sharedWith: sharedWithInput || [], // Ensure sharedWith is an array
  });

  if (!validatedFields.success) {
    return {
      // error: "Dados de compartilhamento inválidos. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
      error: "Dados de compartilhamento inválidos. Verifique os e-mails e permissões.",
    };
  }
  
  const { sharedWith } = validatedFields.data;

  // Simulate updating Google Docs sharing permissions
  // For now, update mock data
  dbUpdateDocumentSharing(validatedFields.data.documentId, sharedWith);
  // console.log(`Simulated sharing update for doc ${documentId}:`, sharedWith);

  revalidatePath("/"); // Revalidate dashboard to reflect sharing changes if displayed
  revalidatePath(`/documents/${documentId}`); // Revalidate document detail page

  return { success: true };
}
