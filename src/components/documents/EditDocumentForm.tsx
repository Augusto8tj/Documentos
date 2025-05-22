
"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import type { DocumentMetadata, DocumentTypeValue, DocumentDepartmentValue, DocumentSourceType } from "@/lib/types";
import { ADMIN_DEPARTMENT, DEFAULT_DOCUMENT_TYPES, DEFAULT_DOCUMENT_DEPARTMENTS } from "@/lib/types";
import { updateDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardPaste, Building } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const localStorageDocumentTypesKey = "docflow-document-types";
const localStorageDepartmentsKey = "docflow-document-departments";

const createEditFormSchema = (
  availableTypes: DocumentTypeValue[],
  availableDepartments: DocumentDepartmentValue[],
  canEditDepartment: boolean,
  existingDepartmentValue?: DocumentDepartmentValue 
) => z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres.",
  }),
  type: z.string({ required_error: "Por favor, selecione um tipo de documento."}).refine(val => availableTypes.includes(val), {
    message: "Por favor, selecione um tipo de documento válido.",
  }),
  department: z.string({ required_error: "Por favor, selecione um departamento."}).refine(val => {
    if (canEditDepartment) {
        return availableDepartments.includes(val);
    }
    // If user can't edit, the value must match the original document's department
    return val === (existingDepartmentValue || ""); // Match string or empty string if undefined
  }, {
    message: "Departamento inválido. Você pode não ter permissão para alterá-lo ou o valor não é reconhecido.",
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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentTypeValue[]>(DEFAULT_DOCUMENT_TYPES);
  const [availableDepartments, setAvailableDepartments] = useState<DocumentDepartmentValue[]>(DEFAULT_DOCUMENT_DEPARTMENTS);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const isAdmin = useMemo(() => (user?.departments || []).includes(ADMIN_DEPARTMENT), [user]);
  const canEditDepartment = isAdmin;

  useEffect(() => {
    setIsLoadingConfig(true);
    try {
      if (typeof window !== 'undefined') {
        const storedTypes = localStorage.getItem(localStorageDocumentTypesKey);
        setAvailableDocumentTypes(storedTypes ? JSON.parse(storedTypes) : [...DEFAULT_DOCUMENT_TYPES]);

        const storedDepts = localStorage.getItem(localStorageDepartmentsKey);
        setAvailableDepartments(storedDepts ? JSON.parse(storedDepts) : [...DEFAULT_DOCUMENT_DEPARTMENTS]);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do localStorage:", error);
      setAvailableDocumentTypes([...DEFAULT_DOCUMENT_TYPES]);
      setAvailableDepartments([...DEFAULT_DOCUMENT_DEPARTMENTS]);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  const currentSchema = useMemo(() => {
    return createEditFormSchema(
        availableDocumentTypes,
        availableDepartments,
        canEditDepartment,
        existingDocument.department
    );
  }, [availableDocumentTypes, availableDepartments, canEditDepartment, existingDocument.department]);

  const form = useForm<z.infer<ReturnType<typeof createEditFormSchema>>>({
    resolver: zodResolver(currentSchema),
    // Default values are set by the useEffect below to ensure they use loaded config
  });
  
  useEffect(() => {
    // This effect resets the form when dynamic config or the document itself changes.
    // Crucial for ensuring the form is initialized with the correct schema and values.
    if (isLoadingConfig || !user || !existingDocument) return;

    form.reset({
      name: existingDocument.name,
      type: availableDocumentTypes.includes(existingDocument.type as DocumentTypeValue) 
            ? existingDocument.type 
            : (availableDocumentTypes.length > 0 ? availableDocumentTypes[0] : ""),
      department: existingDocument.department || "", // Ensure it's a string for the Select
      sourceType: existingDocument.sourceType,
      googleDocsId: existingDocument.googleDocsId || "",
      localFileIdentifier: existingDocument.localFileIdentifier || "",
      internalContent: existingDocument.internalContent || "",
    });

  }, [
    isLoadingConfig, 
    user, 
    existingDocument, 
    form.reset, // form.reset is stable
    availableDocumentTypes, 
    availableDepartments,
    // currentSchema is not needed here as form.reset re-evaluates against the current resolver
  ]);


  useEffect(() => {
    if (user && !isAdmin && existingDocument.department && !(user.departments || []).includes(existingDocument.department)) {
        toast({title: "Acesso Negado", description: "Você não tem permissão para editar documentos deste departamento.", variant: "destructive"});
        router.push("/"); // Or to document detail page
    }
  }, [user, isAdmin, existingDocument.department, router, toast]);

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
        description = "Permissão para acessar a área de transferência negada. Habilite nas configurações do seu navegador ou cole manualmente."
      }
      toast({
        title: "Falha ao Colar",
        description: description,
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<ReturnType<typeof createEditFormSchema>>) {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não logado.", variant: "destructive" });
      return;
    }
    if (!isAdmin && existingDocument.department && !(user.departments || []).includes(existingDocument.department)) {
      toast({ title: "Acesso Negado", description: "Você não pode editar documentos de outro departamento.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("id", existingDocument.id);
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("department", values.department || ""); // Ensure department is always a string
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

  if (isLoadingConfig || !user || !existingDocument) { // Added !existingDocument guard here for initial render
     return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDocumentTypes.map((type) => (
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento/Local</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      disabled={!canEditDepartment}
                    >
                      <FormControl>
                        <SelectTrigger disabled={!canEditDepartment}>
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione um departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {canEditDepartment ? (
                          availableDepartments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))
                        ) : (
                          // If not admin, show current department, or empty if none
                          // The value is already set by form.reset
                          <SelectItem value={field.value || ""}>{field.value || "N/A"}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {!canEditDepartment && <FormDescription>O departamento deste documento não pode ser alterado por você.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Fonte do Documento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        const newSourceType = value as DocumentSourceType;
                        field.onChange(newSourceType);
                        // Clear other source type fields when selection changes
                        if (newSourceType !== "googleDocs") form.setValue("googleDocsId", "");
                        if (newSourceType !== "local") form.setValue("localFileIdentifier", "");
                        if (newSourceType !== "internal") form.setValue("internalContent", "");
                      }}
                      value={field.value}
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
            <Button type="submit" disabled={isSubmitting || isLoadingConfig} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    