
"use client";

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
import { DocumentType, type DocumentSourceType } from "@/lib/types";
import { createDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React from "react";

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
  localFileIdentifier: z.string().optional(),
}).refine(data => {
  if (data.sourceType === "local" && (!data.localFileIdentifier || data.localFileIdentifier.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "O identificador do arquivo local é obrigatório se a fonte for 'Arquivo Local'.",
  path: ["localFileIdentifier"],
});

export function CreateDocumentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sourceType: "internal",
      localFileIdentifier: "",
    },
  });

  const currentSourceType = form.watch("sourceType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("sourceType", values.sourceType);
    if (values.sourceType === "local" && values.localFileIdentifier) {
      formData.append("localFileIdentifier", values.localFileIdentifier);
    }

    const result = await createDocumentAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Documento Criado",
        description: `"${values.name}" foi criado com sucesso.`,
      });
      router.push("/"); 
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
        <CardTitle className="text-2xl">Criar Novo Documento</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo. A numeração automática será aplicada.
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="internal" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Interno (sem link/arquivo)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="googleDocs" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Google Docs (será simulado)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="local" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Arquivo Local (referência)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {currentSourceType === "local" && (
              <FormField
                control={form.control}
                name="localFileIdentifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador do Arquivo Local</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., C:\\Documentos\\ProjetoX.docx ou Servidor\\Oficios\\2024\\..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Insira o caminho ou referência para o arquivo local.
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
