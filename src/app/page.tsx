
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, CheckCircle2, FileEdit, Archive } from "lucide-react";
import { DocumentListClient } from "@/components/documents/DocumentListClient";
import { getDocuments } from "@/data/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentMetadata } from "@/lib/types";

export default async function DashboardPage() {
  const documents = await getDocuments();

  const totalDocuments = documents.length;
  const publishedCount = documents.filter(doc => doc.status === "Published").length;
  const draftCount = documents.filter(doc => doc.status === "Draft").length;
  const archivedCount = documents.filter(doc => doc.status === "Archived").length;

  return (
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Meus Documentos</h1>
          <p className="text-muted-foreground">
            Visualize, crie e gerencie seus documentos.
          </p>
        </div>
        <Link href="/documents/create" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar Novo Documento
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              de todos os tipos e status
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Publicados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              visíveis e finalizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos em Rascunho</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              em elaboração
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Arquivados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedCount}</div>
            <p className="text-xs text-muted-foreground">
              mantidos para referência
            </p>
          </CardContent>
        </Card>
      </div>
      
      <DocumentListClient documents={documents} />
      
    </div>
  );
}
