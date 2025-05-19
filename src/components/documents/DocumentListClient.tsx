
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, Share2, Trash2, MoreVertical, FileText, Eye } from "lucide-react";
import type { DocumentMetadata } from "@/lib/types";
import { ShareDocumentDialog } from "./ShareDocumentDialog";
import { format } from "date-fns";

interface DocumentListClientProps {
  documents: DocumentMetadata[];
}

export function DocumentListClient({ documents: initialDocuments }: DocumentListClientProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>(initialDocuments);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<DocumentMetadata | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleShare = (doc: DocumentMetadata) => {
    setSelectedDocumentForShare(doc);
    setIsShareDialogOpen(true);
  };

  // Placeholder for delete action
  const handleDelete = (docId: string) => {
    console.log("Delete document:", docId);
    setDocuments(documents.filter(doc => doc.id !== docId));
    // TODO: Call server action to delete document
  };

  return (
    <>
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/documents/${doc.id}`} className="hover:underline flex items-center gap-2">
                       <FileText className="h-4 w-4 text-primary" /> {doc.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.number}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === "Published" ? "default" : "secondary"} className={doc.status === "Published" ? "bg-accent text-accent-foreground" : ""}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(doc.updatedAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                           <Link href={`/documents/${doc.id}/edit`} className="flex items-center"> {/* Placeholder edit link */}
                            <Eye className="mr-2 h-4 w-4" /> View/Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(doc)} className="flex items-center">
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive flex items-center">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ShareDocumentDialog
        document={selectedDocumentForShare}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </>
  );
}
