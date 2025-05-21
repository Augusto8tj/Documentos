
"use client";

import React, { useEffect } from "react";
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
import { DocumentType, type DocumentSourceType, type TemplateMetadata } from "@/lib/types";
import { createDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, ClipboardPaste } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres.",
  }),
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Por favor, selecione um tipo de documento." }),
  }),
  sourceType: z.enum(["internal", "googleDocs", "local"], {
    errorMap: () => ({ message: "Por favor, selecione a fonte do documento." }),
  }).default("internal"),
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

interface CreateDocumentFormProps {
  initialTemplate?: TemplateMetadata | null;
}

export function CreateDocumentForm({ initialTemplate }: CreateDocumentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialTemplate ? `Documento Baseado em: ${initialTemplate.name}` : "",
      type: initialTemplate ? initialTemplate.defaultDocumentType : undefined,
      sourceType: "internal",
      googleDocsId: "",
      localFileIdentifier: "",
      internalContent: initialTemplate?.baseContentPreview || "",
    },
  });
  
  const currentSourceType = form.watch("sourceType");

  useEffect(() => {
    if (initialTemplate) {
      form.reset({
        name: `Documento Baseado em: ${initialTemplate.name}`,
        type: initialTemplate.defaultDocumentType,
        sourceType: currentSourceType || "internal",
        googleDocsId: "",
        localFileIdentifier: "",
        internalContent: currentSourceType === "internal" ? initialTemplate.baseContentPreview : "",
      });
    } else {
       form.reset({
        name: "",
        type: undefined, 
        sourceType: currentSourceType || "internal",
        googleDocsId: "",
        localFileIdentifier: "",
        internalContent: "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplate, form]);


  useEffect(() => {
    if (currentSourceType === "internal") {
      if (initialTemplate && form.getValues("internalContent") !== initialTemplate.baseContentPreview ) {
        form.setValue("internalContent", initialTemplate.baseContentPreview);
      }
    } else {
      form.setValue("internalContent", ""); 
    }
  }, [currentSourceType, initialTemplate, form]);

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
        description = "Permissão para acessar a área de transferência negada. Habilite nas configurações do seu navegador ou cole manualmente."
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
    if (initialTemplate) {
      formData.append("templateUsed", initialTemplate.name); 
      formData.append("templateContentPreview", initialTemplate.baseContentPreview);
    }

    const result = await createDocumentAction(formData);

    setIsSubmitting(false);

    if (result.success && result.documentId) {
      let description = `"${values.name}" foi criado. Você será redirecionado para a página de detalhes.`;
      if (values.sourceType === "googleDocs" && initialTemplate) {
        description += ` Lembre-se de criar o documento no Google Docs usando o conteúdo base do modelo e adicionar o ID do Google Doc editando este documento.`;
      } else if (values.sourceType === "local" && initialTemplate) {
         description += ` O conteúdo base do modelo pode ser usado como referência para seu arquivo local.`;
      } else if (values.sourceType === "internal" && initialTemplate) {
        description += ` O conteúdo base do modelo foi pré-preenchido para edição.`;
      }

      toast({
        title: "Documento Criado",
        description: description,
        duration: 7000, 
      });
      router.push(`/documents/${result.documentId}`); 
    } else {
      toast({
        title: "Erro ao Criar Documento",
        description: result.error ? result.error : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialTemplate ? `Criar Documento com Modelo: "${initialTemplate.name}"` : "Criar Novo Documento"}
        </CardTitle>
        <CardDescription>
          {initialTemplate 
            ? `Preencha os detalhes abaixo. O tipo de documento foi pré-selecionado com base no modelo. A numeração automática será aplicada.`
            : `Preencha os detalhes abaixo. A numeração automática será aplicada.`
          }
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {initialTemplate && (
              <div className="p-4 bg-accent/50 border border-accent/70 rounded-md text-sm text-accent-foreground space-y-2">
                <div className="flex items-center font-semibold">
                  <Info className="mr-2 h-5 w-5 text-primary" />
                  Usando o modelo: {initialTemplate.name}
                </div>
                <p className="text-xs pl-7"><strong>Tipo Padrão:</strong> {initialTemplate.defaultDocumentType}</p>
                <p className="text-xs pl-7"><strong>Prévia do Conteúdo Base (para referência):</strong></p>
                <p className="text-xs bg-background/70 p-2 rounded whitespace-pre-wrap max-h-28 overflow-y-auto ml-7">{initialTemplate.baseContentPreview}</p>
              </div>
            )}
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
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                        } else if (value === "local") {
                          form.setValue("googleDocsId", "");
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
                   {currentSourceType === "googleDocs" && initialTemplate && (
                     <FormDescription className="text-xs flex items-start gap-1 pt-1">
                       <Info className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                       <span>Após criar, edite este documento no sistema para adicionar o ID do Google Doc que você criar. O conteúdo base do modelo serve de guia.</span>
                    </FormDescription>
                  )}
                   {currentSourceType === "googleDocs" && !initialTemplate && (
                     <FormDescription className="text-xs flex items-start gap-1 pt-1">
                       <Info className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                       <span>Você precisará informar o ID do documento do Google Docs.</span>
                    </FormDescription>
                  )}
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
                      É o ID encontrado na URL do seu Google Doc (ex: .../document/d/ID_DO_DOCUMENTO/edit).
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
                      Insira o caminho ou referência para o arquivo local. {initialTemplate && "O conteúdo base do modelo serve como guia para seu arquivo."}
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
                    <FormLabel>
                      {initialTemplate ? "Conteúdo Interno do Documento (Baseado no Modelo)" : "Conteúdo Interno do Documento"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={initialTemplate ? "Edite o conteúdo base do modelo aqui..." : "Digite o conteúdo do documento aqui..."}
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Este conteúdo será salvo com o documento.
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
              Criar Documento
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    