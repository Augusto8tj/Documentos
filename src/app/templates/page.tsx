
import { getTemplates } from "@/data/mock-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="container mx-auto py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Modelos de Documentos</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Use estes modelos como ponto de partida para criar seus documentos rapidamente.
        </p>
      </header>

      {templates.length === 0 && (
        <p className="text-center text-muted-foreground">Nenhum modelo disponível no momento.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="text-sm h-20 overflow-hidden text-ellipsis">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Tipo de Documento Padrão:</h4>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">{template.defaultDocumentType}</p>
                <h4 className="font-semibold text-sm text-foreground mt-2">Conteúdo Base (Prévia):</h4>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md whitespace-pre-wrap h-24 overflow-y-auto">
                  {template.baseContentPreview}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Link href={`/documents/create?templateId=${template.id}`} passHref className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <FilePlus2 className="mr-2 h-4 w-4" /> Usar este Modelo
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
       <Card className="mt-12 bg-accent/30 border-accent/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ExternalLink className="mr-2 h-5 w-5 text-primary" />
            Sobre Modelos e Google Docs/Arquivos Locais
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Ao usar um modelo, você pode escolher a fonte do documento (Interno, Google Docs, Arquivo Local) no formulário de criação.
          </p>
          <p>
            <strong>Para Google Docs:</strong> O conteúdo base do modelo (como visto na prévia) serve como uma sugestão. Você precisará criar manualmente seu documento no Google Docs e colar este conteúdo, depois informar o ID do Google Doc no sistema. Não há criação automática de arquivos no Google Docs.
          </p>
          <p>
            <strong>Para Arquivos Locais:</strong> O conteúdo base também é uma sugestão para o arquivo que você criará ou gerenciará localmente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
