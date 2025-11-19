'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
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
import EditForm from './(form)/edit-form';

interface PdfCardProps {
  pdf: PDF;
  onDeleted: (id: string) => void;
}

export default function PdfCard({ pdf, onDeleted }: PdfCardProps) {
  const { isAdmin } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  // Format the upload date properly with better error handling
  let uploadDate = 'Unknown date';
  try {
    if (pdf.uploadDate) {
      let date;
      // Handle different possible date formats
      if (pdf.uploadDate instanceof Date) {
        date = pdf.uploadDate;
      } else if (pdf.uploadDate.seconds) {
        // Firebase Timestamp format
        date = new Date(pdf.uploadDate.seconds * 1000);
      } else if (typeof pdf.uploadDate === 'string') {
        // String date format
        date = new Date(pdf.uploadDate);
      } else if (pdf.uploadDate.toDate) {
        // Firestore Timestamp format
        date = pdf.uploadDate.toDate();
      }
      
      if (date && !isNaN(date.getTime())) {
        uploadDate = format(date, 'MMM d, yyyy');
      }
    }
  } catch (error) {
    console.warn('Error formatting date for PDF:', pdf.id, error);
    uploadDate = 'Unknown date';
  }

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
  
  const handleEditComplete = () => {
    setIsEditOpen(false);
    // Refresh the data - this will be handled by the parent component's useCollection hook
  };
  
  return (
    <>
    <Card className="flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-primary/20 bg-card text-card-foreground">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg leading-tight line-clamp-2 text-foreground">{pdf.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Uploaded by {pdf.uploader} on {uploadDate}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {pdf.category && <Badge variant="secondary" className="text-secondary-foreground">{pdf.category}</Badge>}
        {pdf.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pdf.description}</p>}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 text-primary hover:text-primary-foreground" onClick={() => setIsViewerOpen(true)}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
        <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <a href={pdf.fileUrl} target="_blank" download>
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </a>
        </Button>
        {isAdmin && (
          <>
            <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 text-primary hover:text-primary-foreground" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-9 w-9 p-0 hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span className="sr-only">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the PDF file and its data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel className="border-primary/30 hover:bg-primary/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
     <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-foreground">{pdf.title}</DialogTitle>
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit PDF</DialogTitle>
          </DialogHeader>
          <EditForm pdf={pdf} onEditComplete={handleEditComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
}
