
import { getDocumentById } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Share2, Edit3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

interface DocumentDetailPageProps {
  params: { id: string };
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const document = await getDocumentById(params.id);

  if (!document) {
    notFound();
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{document.name}</CardTitle>
              <CardDescription className="mt-1">
                {document.type} - Number: {document.number}
              </CardDescription>
            </div>
            {document.googleDocsId && (
              <Button variant="outline" asChild>
                <a href={`https://docs.google.com/document/d/${document.googleDocsId}/edit`} target="_blank" rel="noopener noreferrer">
                  Open in Google Docs <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Status:</h3>
            <p className="text-muted-foreground">{document.status}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Created At:</h3>
            <p className="text-muted-foreground">{format(new Date(document.createdAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Last Updated:</h3>
            <p className="text-muted-foreground">{format(new Date(document.updatedAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
          </div>
          {document.sharedWith && document.sharedWith.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground">Shared With:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {document.sharedWith.map(user => (
                  <li key={user.email}>{user.email} ({user.permission})</li>
                ))}
              </ul>
            </div>
          )}
          {!document.googleDocsId && (
             <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
              This document is managed internally. No Google Docs link available yet.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
          {/* Share Button could be re-enabled here if ShareDocumentDialog is adapted for this page */}
          {/* <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button> */}
          <Link href={`/documents/${document.id}/edit`} passHref>
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Edit3 className="mr-2 h-4 w-4" /> Edit Details</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
