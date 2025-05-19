
import type { DocumentMetadata } from "@/lib/types";
import { DocumentType } from "@/lib/types";

export const mockDocuments: DocumentMetadata[] = [
  {
    id: "1",
    name: "Ofício Solicitação de Equipamentos",
    type: DocumentType.OFICIO,
    number: "OF-2024-001",
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 16).toISOString(),
    googleDocsId: "mockGoogleDocId1",
    sharedWith: [{ email: "colleague1@example.com", permission: "edit" }],
    status: "Published",
  },
  {
    id: "2",
    name: "Memorando Interno Reunião Semanal",
    type: DocumentType.MEMORANDO,
    number: "MEM-2024-001",
    createdAt: new Date(2024, 1, 10).toISOString(),
    updatedAt: new Date(2024, 1, 10).toISOString(),
    status: "Draft",
  },
  {
    id: "3",
    name: "Portaria de Nomeação",
    type: DocumentType.PORTARIA,
    number: "PORT-2024-005",
    createdAt: new Date(2024, 2, 5).toISOString(),
    updatedAt: new Date(2024, 2, 5).toISOString(),
    googleDocsId: "mockGoogleDocId3",
    sharedWith: [
      { email: "manager@example.com", permission: "view" },
      { email: "hr@example.com", permission: "view" },
    ],
    status: "Published",
  },
  {
    id: "4",
    name: "Ata da Reunião de Diretoria",
    type: DocumentType.ATA,
    number: "ATA-2024-002",
    createdAt: new Date(2024, 3, 20).toISOString(),
    updatedAt: new Date(2024, 3, 22).toISOString(),
    status: "Published",
  },
  {
    id: "5",
    name: "Decreto Municipal Feriado",
    type: DocumentType.DECRETO,
    number: "DEC-2024-010",
    createdAt: new Date(2024, 4, 1).toISOString(),
    updatedAt: new Date(2024, 4, 1).toISOString(),
    status: "Published",
  },
];

// Simulate a data store for actions
export let userDocuments: DocumentMetadata[] = [...mockDocuments];

export const addDocument = (doc: DocumentMetadata) => {
  userDocuments.unshift(doc); // Add to the beginning of the array
};

export const updateDocumentSharing = (docId: string, sharedWith: DocumentMetadata['sharedWith']) => {
  const docIndex = userDocuments.findIndex(d => d.id === docId);
  if (docIndex !== -1) {
    userDocuments[docIndex].sharedWith = sharedWith;
    userDocuments[docIndex].updatedAt = new Date().toISOString();
  }
};

export const getDocuments = async (): Promise<DocumentMetadata[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...userDocuments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getDocumentById = async (id: string): Promise<DocumentMetadata | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return userDocuments.find(doc => doc.id === id);
};
