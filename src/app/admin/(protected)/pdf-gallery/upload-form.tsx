
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useUser } from '@/components/providers/app-providers';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPdf } from '@/app/actions/pdf-actions';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.string().optional(),
  file: z.instanceof(File).refine(file => file.size > 0, 'Please select a file.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadForm({ onUploadComplete }: { onUploadComplete: () => void }) {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', category: '', file: undefined },
  });

  async function onSubmit(data: FormValues) {
    if (!user || !isAdmin) {
      setFormError('You must be an admin to upload files.');
      return;
    }

    setIsUploading(true);
    setFormError(null);
    setUploadProgress(0);

    const storage = getStorage();
    const storageRef = ref(storage, `pdfFiles/${Date.now()}-${data.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, data.file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload Error:", error);
        setFormError('File upload failed. Please try again.');
        setIsUploading(false);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message,
        });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const idToken = await user.getIdToken();
          
          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('fileUrl', downloadURL);
          formData.append('category', data.category || '');
          formData.append('uploader', user.displayName || user.email || 'Admin');

          const result = await createPdf(idToken, formData);

          if (result.error) {
            setFormError(result.error);
             toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error,
            });
          } else {
            toast({
              title: 'Success!',
              description: 'PDF has been uploaded successfully.',
            });
            form.reset();
            onUploadComplete();
          }
        } catch (error: any) {
          setFormError('An error occurred while saving the file data.');
          toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message,
            });
        } finally {
          setIsUploading(false);
        }
      }
    );
  }

  if (!isAdmin) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Upload New PDF</h2>
         {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input placeholder="E.g., Q4 Financial Report" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="E.g., Financials" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isUploading && <Progress value={uploadProgress} className="w-full" />}
        <Button type="submit" disabled={isUploading}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload PDF'}
        </Button>
      </form>
    </Form>
  );
}
