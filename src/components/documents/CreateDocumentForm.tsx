
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
import { Textarea } from "@/components/ui/textarea";
import { DocumentType } from "@/lib/types";
import { createDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React from "react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Document name must be at least 3 characters.",
  }),
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Please select a document type." }),
  }),
  // content: z.string().optional(), // For initial notes or brief content
});

export function CreateDocumentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      // type: undefined, // Let placeholder handle initial state
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    // if (values.content) formData.append("content", values.content);

    const result = await createDocumentAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Document Created",
        description: `"${values.name}" has been successfully created. Numbering and Google Docs link will be simulated.`,
      });
      router.push("/"); // Redirect to dashboard
    } else {
      toast({
        title: "Error Creating Document",
        description: result.error ? JSON.stringify(result.error) : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Document</CardTitle>
        <CardDescription>
          Fill in the details below. Automatic numbering will be applied, and the document will be (simulated) created in Google Docs.
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
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Solicitação de Férias" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive name for your document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
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
                  <FormDescription>
                    Choose the category for this document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any initial notes or a brief summary for the document..."
                      className="resize-none"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                   <FormDescription>
                    This content is for internal reference or can be used as a starting point in Google Docs.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Document
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
