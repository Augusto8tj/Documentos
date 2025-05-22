
"use client"; // Convert to client component

import React, { useEffect, useState } from 'react'; // Ensure React is imported
import { getDocumentById } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { EditDocumentForm } from "@/components/documents/EditDocumentForm";
import type { DocumentMetadata, DocumentDepartmentValue } from '@/lib/types';
import { ADMIN_DEPARTMENT } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface DocumentEditPageProps {
  params: Promise<{ id: string }>; // Updated type
}

export default function DocumentEditPage({ params: paramsPromise }: DocumentEditPageProps) {
  const resolvedParams = React.use(paramsPromise); // Unwrap params
  const documentId = resolvedParams.id;

  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentMetadata | null | undefined>(undefined);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (authIsLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchDocumentForEdit() {
      setIsLoadingDoc(true);
      setAccessDenied(false);
      const fetchedDocument = await getDocumentById(documentId); // Use resolved documentId
      
      if (!fetchedDocument) {
        setDocument(null); // Will trigger notFound
        setIsLoadingDoc(false);
        return;
      }

      const userIsAdmin = (user.departments || []).includes(ADMIN_DEPARTMENT);
      // Ensure fetchedDocument.department exists before trying to check if it's in user.departments
      if (!userIsAdmin && fetchedDocument.department && !(user.departments || []).includes(fetchedDocument.department)) {
        setAccessDenied(true);
        setDocument(fetchedDocument); // Still set doc to show its name in denial message
      } else {
        setDocument(fetchedDocument);
      }
      setIsLoadingDoc(false);
    }

    if (documentId) { // Ensure documentId is available
        fetchDocumentForEdit();
    }
  }, [documentId, user, authIsLoading, router]); // Updated dependency

  if (authIsLoading || isLoadingDoc || document === undefined) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!document && !accessDenied) { // Document truly not found
    notFound();
  }
  
  if (accessDenied && document) {
     return (
      <div className="container mx-auto py-10 flex flex-col items-center text-center">
        <Card className="p-8 max-w-lg w-full shadow-lg">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-destructive mb-2">Acesso Negado</CardTitle>
          <CardDescription className="text-muted-foreground mb-6">
            Você não tem permissão para editar o documento "{document.name}" pois ele pertence a outro departamento.
          </CardDescription>
          <Button onClick={() => router.push('/')} variant="outline">Voltar para o Painel</Button>
        </Card>
      </div>
    );
  }
  
  // If document exists and access is not denied
  if (!document) notFound(); // Should not be reached if accessDenied logic is correct, but as a safeguard

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <Link href={`/documents/${document.id}`} passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes do Documento
          </Button>
        </Link>
      </div>
      
      <EditDocumentForm existingDocument={document} />
      
    </div>
  );
}
