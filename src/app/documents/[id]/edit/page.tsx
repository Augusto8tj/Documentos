
import { getDocumentById } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
// Card components are now part of EditDocumentForm
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditDocumentForm } from "@/components/documents/EditDocumentForm";

interface DocumentEditPageProps {
  params: { id: string };
}

export default async function DocumentEditPage({ params }: DocumentEditPageProps) {
  const document = await getDocumentById(params.id);

  if (!document) {
    notFound();
  }

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
