
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
import type { TemplateMetadata, LoggedInUser, DocumentTypeValue, DocumentDepartmentValue } from "@/lib/types";
import { ADMIN_DEPARTMENT, DEFAULT_DOCUMENT_TYPES, DEFAULT_DOCUMENT_DEPARTMENTS } from "@/lib/types";
import { createDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, ClipboardPaste, Building } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";


const localStorageDocumentTypesKey = "docflow-document-types";
const localStorageDepartmentsKey = "docflow-document-departments";

const createFormSchema = (
  availableTypes: DocumentTypeValue[], 
  availableDepartments: DocumentDepartmentValue[],
  userDepartments?: DocumentDepartmentValue[] // For non-admin users with multiple departments
) => z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres.",
  }),
  type: z.string().refine(val => availableTypes.includes(val), {
    message: "Por favor, selecione um tipo de documento válido.",
  }),
  department: z.string().refine(val => {
    if (userDepartments) { // Non-admin with multiple departments
      return userDepartments.includes(val);
    }
    return availableDepartments.includes(val); // Admin or non-admin with single (pre-filled) dept
  }, {
    message: "Por favor, selecione um departamento válido.",
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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentTypeValue[]>(DEFAULT_DOCUMENT_TYPES);
  const [availableDepartments, setAvailableDepartments] = useState<DocumentDepartmentValue[]>(DEFAULT_DOCUMENT_DEPARTMENTS);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const isAdmin = useMemo(() => (user?.departments || []).includes(ADMIN_DEPARTMENT), [user]);
  
  const userSelectableDepartments = useMemo(() => {
    if (!user) return [];
    if (isAdmin) return availableDepartments; // Admin can choose any loaded department
    return user.departments || []; // Non-admin can choose from their assigned departments
  }, [user, isAdmin, availableDepartments]);


  useEffect(() => {
    setIsLoadingConfig(true);
    try {
      const storedTypes = localStorage.getItem(localStorageDocumentTypesKey);
      setAvailableDocumentTypes(storedTypes ? JSON.parse(storedTypes) : [...DEFAULT_DOCUMENT_TYPES]);

      const storedDepts = localStorage.getItem(localStorageDepartmentsKey);
      setAvailableDepartments(storedDepts ? JSON.parse(storedDepts) : [...DEFAULT_DOCUMENT_DEPARTMENTS]);
    } catch (error) {
      console.error("Erro ao carregar configurações do localStorage:", error);
      setAvailableDocumentTypes([...DEFAULT_DOCUMENT_TYPES]);
      setAvailableDepartments([...DEFAULT_DOCUMENT_DEPARTMENTS]);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);
  
  const currentSchema = useMemo(() => {
      const departmentsForSchema = isAdmin ? availableDepartments : userSelectableDepartments;
      return createFormSchema(availableDocumentTypes, departmentsForSchema, !isAdmin ? userSelectableDepartments : undefined);
  }, [availableDocumentTypes, availableDepartments, isAdmin, userSelectableDepartments]);


  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(currentSchema),
    // Default values are set in a useEffect below to ensure they use loaded config
  });
  
  const currentSourceType = form.watch("sourceType");

  useEffect(() => {
    if (isLoadingConfig || !user) return; // Wait for config and user

    let defaultDept: DocumentDepartmentValue | undefined = undefined;
    if (!isAdmin) {
        if (user.departments && user.departments.length > 0) {
            defaultDept = user.departments[0]; // Pre-fill with the first one for non-admins
        }
    } else {
      // For admin, if availableDepartments has been loaded and contains ADMIN_DEPARTMENT, set it as default
      // Otherwise, set the first available department, or undefined if none
      if(availableDepartments.includes(ADMIN_DEPARTMENT)) {
        defaultDept = ADMIN_DEPARTMENT;
      } else if (availableDepartments.length > 0) {
        defaultDept = availableDepartments[0];
      }
    }

    const defaultType = initialTemplate 
        ? (availableDocumentTypes.includes(initialTemplate.defaultDocumentType) ? initialTemplate.defaultDocumentType : (availableDocumentTypes.length > 0 ? availableDocumentTypes[0] : undefined))
        : (availableDocumentTypes.length > 0 ? availableDocumentTypes[0] : undefined);

    form.reset({
      name: initialTemplate ? `Documento Baseado em: ${initialTemplate.name}` : "",
      type: defaultType,
      department: defaultDept,
      sourceType: form.getValues("sourceType") || "internal",
      googleDocsId: "",
      localFileIdentifier: "",
      internalContent: (form.getValues("sourceType") === "internal" || (!form.getValues("sourceType") && "internal" === "internal")) && initialTemplate
                         ? initialTemplate.baseContentPreview 
                         : "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplate, user, isAdmin, isLoadingConfig, availableDocumentTypes, availableDepartments, form.reset]); // Added form.reset to dep array


  useEffect(() => {
    if (currentSourceType === "internal") {
      if (initialTemplate && form.getValues("internalContent") !== initialTemplate.baseContentPreview ) {
        if(!form.getValues("internalContent") || form.getValues("internalContent") === ""){
            form.setValue("internalContent", initialTemplate.baseContentPreview);
        }
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


  async function onSubmit(values: z.infer<ReturnType<typeof createFormSchema>>) {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não logado.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("department", values.department); 
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

    formData.append("authorName", user.name);
    formData.append("authorEmail", user.email);

    const result = await createDocumentAction(formData);
    setIsSubmitting(false);

    if (result.success && result.documentId) {
      let description = `Documento "${values.name}" criado. Você será redirecionado para a página de detalhes.`;
      if (values.sourceType === "googleDocs" && initialTemplate) {
        description += " Lembre-se de criar o documento no Google Docs e usar o ID fornecido aqui.";
      } else if (values.sourceType === "googleDocs" && !values.googleDocsId && !initialTemplate) {
        // This case shouldn't happen due to Zod validation, but as a fallback message
        description += " Lembre-se de editar este documento no sistema para adicionar o ID do Google Doc.";
      }
      toast({ title: "Documento Criado", description, duration: 7000 });
      router.push(`/documents/${result.documentId}`); 
    } else {
      toast({
        title: "Erro ao Criar Documento",
        description: result.error ? result.error : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
  }
  
  if (isLoadingConfig || !user) { 
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                      defaultValue={field.value}
                      disabled={!isAdmin && user && user.departments && user.departments.length === 1}
                    >
                      <FormControl>
                        <SelectTrigger disabled={!isAdmin && user && user.departments && user.departments.length === 1}>
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione um departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userSelectableDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isAdmin && user && user.departments && user.departments.length === 1 && <FormDescription>Departamento definido pelo seu perfil.</FormDescription>}
                    {!isAdmin && user && user.departments && user.departments.length > 1 && <FormDescription>Escolha um dos seus departamentos.</FormDescription>}
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
                        field.onChange(value);
                        form.setValue("googleDocsId", "");
                        form.setValue("localFileIdentifier", "");
                        if (value === "internal" && initialTemplate) {
                           form.setValue("internalContent", initialTemplate.baseContentPreview);
                        } else if (value !== "internal") {
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
                      {initialTemplate && form.getValues("internalContent") === initialTemplate.baseContentPreview 
                        ? "Conteúdo Interno do Documento (Baseado no Modelo)" 
                        : "Conteúdo Interno do Documento"}
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
            <Button type="submit" disabled={isSubmitting || isLoadingConfig} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Documento
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    