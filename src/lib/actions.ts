
"use server";

import { z } from "zod";
import { DocumentType, type DocumentMetadata } from "./types";
import { addDocument as dbAddDocument, updateDocumentSharing as dbUpdateDocumentSharing, userDocuments } from "@/data/mock-data";
import { revalidatePath } from "next/cache";

const CreateDocumentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
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
      error: "Invalid data. " + validatedFields.error.flatten().fieldErrors,
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
    email: z.string().email(),
    permission: z.enum(["view", "edit"]),
  })),
});

export async function shareDocumentAction(documentId: string, sharedWith: DocumentMetadata['sharedWith']) {
  const validatedFields = ShareDocumentSchema.safeParse({
    documentId,
    sharedWith,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid sharing data. " + validatedFields.error.flatten().fieldErrors,
    };
  }
  
  // Simulate updating Google Docs sharing permissions
  // For now, update mock data
  dbUpdateDocumentSharing(validatedFields.data.documentId, validatedFields.data.sharedWith);
  // console.log(`Simulated sharing update for doc ${documentId}:`, sharedWith);

  revalidatePath("/"); // Revalidate dashboard to reflect sharing changes if displayed

  return { success: true };
}
