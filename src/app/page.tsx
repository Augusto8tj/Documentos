
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { DocumentListClient } from "@/components/documents/DocumentListClient";
import { getDocuments } from "@/data/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const documents = await getDocuments();

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

      <DocumentListClient documents={documents} />
      
      {/* Example of how to use Card for other sections if needed */}
      {/* 
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              de todos os tipos
            </p>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
