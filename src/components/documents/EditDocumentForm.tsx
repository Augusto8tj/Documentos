
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DocumentType, type DocumentMetadata, type DocumentSourceType } from "@/lib/types";
import { updateDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardPaste } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres.",
  }),
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Por favor, selecione um tipo de documento." }),
  }),
  sourceType: z.enum(["internal", "googleDocs", "local"],{
    errorMap: () => ({ message: "Por favor, selecione a fonte do documento." }),
  }),
  googleDocsId: z.string().optional(),
  localFileIdentifier: z.string().optional(),
  internalContent: z.string().optional(),
}).refine(data => {
  if (data.sourceType === "local" && (!data.localFileIdentifier || data.localFileIdentifier.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O identificador do arquivo local é obrigatório se a fonte for 'Arquivo Local'.",
  path: ["localFileIdentifier"],
}).refine(data => {
  if (data.sourceType === "googleDocs" && (!data.googleDocsId || data.googleDocsId.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O ID do Google Docs é obrigatório se a fonte for 'Google Docs'.",
  path: ["googleDocsId"],
});


interface EditDocumentFormProps {
  existingDocument: DocumentMetadata;
}

export function EditDocumentForm({ existingDocument }: EditDocumentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingDocument.name,
      type: existingDocument.type,
      sourceType: existingDocument.sourceType,
      googleDocsId: existingDocument.googleDocsId || "",
      localFileIdentifier: existingDocument.localFileIdentifier || "",
      internalContent: existingDocument.internalContent || "",
    },
  });

  const currentSourceType = form.watch("sourceType");

  async function handlePasteFromClipboard(fieldName: "googleDocsId" | "localFileIdentifier") {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast({
        title: "Função não suportada",
        description: "Seu navegador não suporta colar da área de transferência desta forma.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        form.setValue(fieldName, text, { shouldValidate: true });
        toast({
          title: "Conteúdo Colado!",
          description: `O conteúdo da área de transferência foi colado em ${fieldName === "googleDocsId" ? "ID do Google Docs" : "Identificador do Arquivo Local"}.`,
        });
      } else {
        toast({
          title: "Área de Transferência Vazia",
          description: "Nenhum texto encontrado na área de transferência.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Falha ao colar da área de transferência:", error);
       let description = "Não foi possível acessar a área de transferência. Verifique as permissões do navegador ou tente colar manualmente.";
      if (error instanceof Error && error.name === 'NotAllowedError') {
        description = "Permissão para acessar a área de transferência negada. Habilite nas configurações do seu navegador ou cole manually."
      }
      toast({
        title: "Falha ao Colar",
        description: description,
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("id", existingDocument.id);
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("sourceType", values.sourceType);

    if (values.sourceType === "googleDocs" && values.googleDocsId) {
      formData.append("googleDocsId", values.googleDocsId);
    }
    if (values.sourceType === "local" && values.localFileIdentifier) {
      formData.append("localFileIdentifier", values.localFileIdentifier);
    }
    if (values.sourceType === "internal" && values.internalContent) {
      formData.append("internalContent", values.internalContent);
    }


    const result = await updateDocumentAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Documento Atualizado",
        description: `"${values.name}" foi atualizado com sucesso.`,
      });
      router.push(`/documents/${existingDocument.id}`); 
      router.refresh(); 
    } else {
      toast({
        title: "Erro ao Atualizar Documento",
        description: result.error ? result.error : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Editar Documento: {existingDocument.name}</CardTitle>
        <CardDescription>
          Modifique os detalhes do documento abaixo. O número do documento ({existingDocument.number}) não pode ser alterado.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Solicitação de Férias" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DocumentType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Fonte do Documento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "internal") {
                          form.setValue("googleDocsId", "");
                          form.setValue("localFileIdentifier", "");
                        } else if (value === "googleDocs") {
                          form.setValue("localFileIdentifier", "");
                          form.setValue("internalContent", "");
                        } else if (value === "local") {
                          form.setValue("googleDocsId", "");
                          form.setValue("internalContent", "");
                        }
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="internal" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Interno (conteúdo no sistema)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="googleDocs" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Google Docs
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="local" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Arquivo Local
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {currentSourceType === "googleDocs" && (
              <FormField
                control={form.control}
                name="googleDocsId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Google Docs</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="Cole ou digite o ID do Google Doc" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handlePasteFromClipboard("googleDocsId")}
                        aria-label="Colar ID do Google Docs da área de transferência"
                      >
                        <ClipboardPaste className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      O ID encontrado na URL do seu Google Doc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {currentSourceType === "local" && (
              <FormField
                control={form.control}
                name="localFileIdentifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador do Arquivo Local</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="Cole ou digite o caminho/referência" {...field} />
                      </FormControl>
                      <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handlePasteFromClipboard("localFileIdentifier")}
                          aria-label="Colar identificador da área de transferência"
                      >
                          <ClipboardPaste className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                     Insira o caminho ou referência para o arquivo local.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {currentSourceType === "internal" && (
              <FormField
                control={form.control}
                name="internalContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo Interno do Documento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite o conteúdo do documento aqui..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      Este conteúdo é salvo diretamente no sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    