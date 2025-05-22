
"use client"; // Convert to client component for auth check

import React, { useEffect, useState } from 'react'; // Import React
import { getDocumentById } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Edit3, Folder, FileArchive, User, Building, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DocumentMetadata, DocumentSourceType } from "@/lib/types";
import { ADMIN_DEPARTMENT } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>; // Updated type
}

export default function DocumentDetailPage({ params: paramsPromise }: DocumentDetailPageProps) {
  const resolvedParams = React.use(paramsPromise); // Unwrap params
  const documentId = resolvedParams.id;

  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentMetadata | null | undefined>(undefined); // undefined: loading, null: not found or access denied
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);

  useEffect(() => {
    if (authIsLoading) return; // Wait for auth state

    if (!user) {
      router.push("/login"); 
      return;
    }

    async function fetchDocument() {
      setIsLoadingDoc(true);
      const fetchedDocument = await getDocumentById(documentId); // Use resolved documentId
      if (!fetchedDocument) {
        setDocument(null); // Triggers notFound later
        setIsLoadingDoc(false);
        return;
      }

      const userIsAdmin = (user.departments || []).includes(ADMIN_DEPARTMENT);
      if (!userIsAdmin && (!fetchedDocument.department || !(user.departments || []).includes(fetchedDocument.department))) {
        setDocument(null); // Mark as not found for non-admins trying to access other dept docs
      } else {
        setDocument(fetchedDocument);
      }
      setIsLoadingDoc(false);
    }

    if (documentId) { // Ensure documentId is available
        fetchDocument();
    }
  }, [documentId, user, authIsLoading, router]); // Updated dependency


  if (authIsLoading || isLoadingDoc || document === undefined) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) { // Handles not found or access denied after checks
    notFound();
  }

  const getPermissionLabel = (permission: "view" | "edit") => {
    if (permission === "view") return "visualizar";
    if (permission === "edit") return "editar";
    return permission;
  };

  const getSourceTypeLabel = (sourceType: DocumentSourceType) => {
    switch (sourceType) {
      case "googleDocs":
        return "Google Docs";
      case "local":
        return "Arquivo Local";
      case "internal":
        return "Interno (Gerenciado no Sistema)";
      default:
        return "Desconhecida";
    }
  };

  const canEditThisDocument = (user?.departments || []).includes(ADMIN_DEPARTMENT) || ((user?.departments || []).includes(document.department || ""));

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Painel
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{document.name}</CardTitle>
              <CardDescription
                className="mt-2 text-lg font-semibold text-foreground border border-border rounded-md p-3 bg-muted/20 shadow-sm"
              >
                <span>{document.type} - Número: </span>
                <span className="text-primary font-bold">{document.number}</span>
              </CardDescription>
            </div>
            {document.sourceType === "googleDocs" && document.googleDocsId && (
              <Button variant="outline" asChild>
                <a href={`https://docs.google.com/document/d/${document.googleDocsId}/edit`} target="_blank" rel="noopener noreferrer">
                  Abrir no Google Docs <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Status:</h3>
            <p className="text-muted-foreground">
              {document.status === "Published" ? "Publicado" : document.status === "Draft" ? "Rascunho" : document.status === "Archived" ? "Arquivado" : document.status}
            </p>
          </div>
          {document.department && (
            <div>
              <h3 className="font-semibold text-foreground flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" /> Departamento/Local:
              </h3>
              <p className="text-muted-foreground ml-6">{document.department}</p>
            </div>
          )}
           <div>
            <h3 className="font-semibold text-foreground">Fonte do Documento:</h3>
            <p className="text-muted-foreground flex items-center">
              {document.sourceType === "local" ? <Folder className="mr-2 h-4 w-4 text-primary" /> :
               document.sourceType === "googleDocs" ? <ExternalLink className="mr-2 h-4 w-4 text-primary" /> :
               <FileArchive className="mr-2 h-4 w-4 text-primary" />
              }
              {getSourceTypeLabel(document.sourceType)}
            </p>
          </div>
          {document.sourceType === "local" && document.localFileIdentifier && (
            <div>
              <h3 className="font-semibold text-foreground">Referência do Arquivo Local:</h3>
              <p className="text-muted-foreground break-all bg-muted p-2 rounded-md">{document.localFileIdentifier}</p>
            </div>
          )}
          {document.sourceType === "internal" && (
             <>
              {document.internalContent ? (
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">Conteúdo do Documento:</h3>
                  <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap text-muted-foreground text-sm max-h-[400px] overflow-y-auto border">
                    {document.internalContent}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md mt-2">
                  Este documento é gerenciado internamente e não possui conteúdo textual associado ou ele está vazio.
                </p>
              )}
            </>
          )}
          {document.sourceType === "googleDocs" && !document.googleDocsId && (
             <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
              Este documento está marcado como Google Docs, mas nenhum ID foi fornecido. Edite para adicionar.
            </p>
          )}
          <div>
            <h3 className="font-semibold text-foreground flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" /> Autor:
            </h3>
            {document.author ? (
              <p className="text-muted-foreground ml-6">
                {document.author.name} ({document.author.email})
              </p>
            ) : (
              <p className="text-muted-foreground ml-6 italic">
                Autor não informado
              </p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Criado em:</h3>
            <p className="text-muted-foreground">{format(new Date(document.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Última Atualização:</h3>
            <p className="text-muted-foreground">{format(new Date(document.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
          {document.sharedWith && document.sharedWith.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground">Compartilhado Com:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {document.sharedWith.map(u => (
                  <li key={u.email}>{u.email} ({getPermissionLabel(u.permission)})</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {canEditThisDocument && (
          <CardFooter className="flex justify-end gap-2 pt-6">
            <Link href={`/documents/${document.id}/edit`} passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Edit3 className="mr-2 h-4 w-4" /> Editar Detalhes</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
