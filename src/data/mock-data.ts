
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
    sourceType: "googleDocs",
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
    sourceType: "internal",
    internalContent: "Este é o conteúdo do memorando sobre a reunião semanal.\n\nTópicos a serem discutidos:\n1. Revisão das metas do último sprint.\n2. Planejamento para o próximo sprint.\n3. Feedback dos clientes.",
    status: "Draft",
  },
  {
    id: "3",
    name: "Portaria de Nomeação",
    type: DocumentType.PORTARIA,
    number: "PORT-2024-005",
    createdAt: new Date(2024, 2, 5).toISOString(),
    updatedAt: new Date(2024, 2, 5).toISOString(),
    sourceType: "googleDocs",
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
    sourceType: "local",
    localFileIdentifier: "C:\\Reuniões\\Diretoria\\ATA-2024-002.pdf",
    status: "Published",
  },
  {
    id: "5",
    name: "Decreto Municipal Feriado",
    type: DocumentType.DECRETO,
    number: "DEC-2024-010",
    createdAt: new Date(2024, 4, 1).toISOString(),
    updatedAt: new Date(2024, 4, 1).toISOString(),
    sourceType: "internal",
    internalContent: "DECRETO Nº DEC-2024-010\n\nConsiderando a data comemorativa de Corpus Christi,\n\nArt. 1º Fica decretado ponto facultativo nas repartições públicas municipais no dia XX de Mês de XXXX.\nArt. 2º Este decreto entra em vigor na data de sua publicação.",
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

export const updateDocumentMetadata = (
  docId: string,
  updates: Partial<DocumentMetadata> 
): boolean => {
  const docIndex = userDocuments.findIndex(d => d.id === docId);
  if (docIndex !== -1) {
    userDocuments[docIndex] = {
      ...userDocuments[docIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Ensure consistency based on sourceType
    if (updates.sourceType === "googleDocs") {
      userDocuments[docIndex].localFileIdentifier = undefined;
      userDocuments[docIndex].internalContent = undefined;
    } else if (updates.sourceType === "local") {
      userDocuments[docIndex].googleDocsId = undefined;
      userDocuments[docIndex].internalContent = undefined;
    } else if (updates.sourceType === "internal") {
      userDocuments[docIndex].googleDocsId = undefined;
      userDocuments[docIndex].localFileIdentifier = undefined;
      // internalContent is set via 'updates' if provided, or remains if not in 'updates'
      if (updates.internalContent !== undefined) {
        userDocuments[docIndex].internalContent = updates.internalContent;
      }
    } else { // If sourceType is not in updates, but other fields are, ensure internalContent is cleared if it's not internal
        if(userDocuments[docIndex].sourceType !== 'internal') {
            userDocuments[docIndex].internalContent = undefined;
        }
    }
    return true;
  }
  return false; // Document not found
};


export const getDocuments = async (): Promise<DocumentMetadata[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return a sorted copy (most recent first)
  return [...userDocuments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getDocumentById = async (id: string): Promise<DocumentMetadata | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return userDocuments.find(doc => doc.id === id);
};

    