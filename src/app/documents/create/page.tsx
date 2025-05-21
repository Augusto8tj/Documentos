
"use client"; // Mark as a Client Component to use useSearchParams

import { CreateDocumentForm } from "@/components/documents/CreateDocumentForm";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { TemplateMetadata } from "@/lib/types";
import { getTemplateById } from "@/data/mock-templates";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateDocumentPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | null | undefined>(undefined); // undefined initially, null if not found or no ID
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  useEffect(() => {
    if (templateId) {
      setIsLoadingTemplate(true);
      getTemplateById(templateId)
        .then(template => {
          setSelectedTemplate(template || null);
        })
        .catch(() => setSelectedTemplate(null))
        .finally(() => setIsLoadingTemplate(false));
    } else {
      setSelectedTemplate(null); // No template ID, so set to null
    }
  }, [templateId]);

  if (templateId && isLoadingTemplate) {
    return (
      <div className="container mx-auto py-10">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/4 mt-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/4 mt-4" />
            <Skeleton className="h-20 w-full" />
          </div>
           <div className="flex justify-end pt-6">
             <Skeleton className="h-10 w-32" />
           </div>
        </div>
      </div>
    );
  }
  
  // Render form once loading is done or if no templateId was provided
  // Pass selectedTemplate (which can be null) to the form
  return (
    <div className="container mx-auto py-2">
      <CreateDocumentForm initialTemplate={selectedTemplate === undefined && !templateId ? null : selectedTemplate} />
    </div>
  );
}
