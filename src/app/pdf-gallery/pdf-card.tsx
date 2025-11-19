
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PDF } from '@/lib/types';
import { useUser } from '@/components/providers/app-providers';
import { useToast } from '@/hooks/use-toast';
import { deletePdf } from '@/app/actions/pdf-actions';
import { format } from 'date-fns';

interface PdfCardProps {
  pdf: PDF;
  onDeleted: (id: string) => void;
}

export default function PdfCard({ pdf, onDeleted }: PdfCardProps) {
  const { isAdmin } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const uploadDate = pdf.uploadDate ? format(new Date(pdf.uploadDate), 'MMM d, yyyy') : 'N/A';

  // Use the fileUrl directly for downloads. The preview URL is for viewing.
  const downloadUrl = pdf.fileUrl.replace('/preview', '');

  const handleDelete = async () => {
    if (!user || !isAdmin) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unauthorized' });
      return;
    }
    setIsDeleting(true);
    try {
      const idToken = await user.getIdToken();
      const result = await deletePdf(idToken, pdf.id);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Success', description: 'PDF deleted successfully.' });
        onDeleted(pdf.id);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
    <Card className="flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg leading-tight line-clamp-2">{pdf.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Uploaded by {pdf.uploader}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {pdf.category && <Badge variant="secondary">{pdf.category}</Badge>}
        {pdf.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pdf.description}</p>}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{uploadDate}</p>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(true)}>
                <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            {isAdmin && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-9 w-9">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the PDF record.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </CardFooter>
    </Card>
     <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
              <DialogTitle>{pdf.title}</DialogTitle>
               <DialogDescription>
                  Uploaded on {uploadDate}
              </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6">
              <iframe
              src={pdf.fileUrl}
              className="w-full h-full border rounded-md"
              title={pdf.title}
              />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
