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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Link, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPdf } from '@/app/actions/pdf-actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.string().optional(),
  fileUrl: z.string().url('Please enter a valid Google Drive share link.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadForm({ onUploadComplete }: { onUploadComplete: () => void }) {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', category: '', fileUrl: '', description: '' },
  });

  const fileUrl = form.watch('fileUrl');

  async function onSubmit(data: FormValues) {
    if (!user || !isAdmin) {
      setFormError('You must be an admin to add PDFs.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
        const idToken = await user.getIdToken();
        
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('fileUrl', data.fileUrl);
        formData.append('category', data.category || '');
        formData.append('description', data.description || '');
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
            description: 'PDF has been added successfully.',
        });
        form.reset();
        onUploadComplete();
        }
    } catch (error: any) {
        setFormError('An error occurred while saving the PDF data.');
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Add PDF from Google Drive</h2>
         {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-foreground">Title</FormLabel>
                <FormControl>
                    <Input placeholder="E.g., Q4 Financial Report" {...field} className="border-primary/30 focus-visible:ring-primary" />
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
                <FormLabel className="text-foreground">Category (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="E.g., Financials" {...field} className="border-primary/30 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="fileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Google Drive Share Link</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                    <Input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    {...field}
                    className="border-primary/30 focus-visible:ring-primary"
                    />
                </FormControl>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    disabled={!fileUrl}
                    onClick={() => window.open(fileUrl, '_blank')}
                    aria-label="Preview PDF"
                    className="border-primary/30 hover:bg-primary/10"
                >
                    <Eye className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <FormDescription>
                Paste the shareable link for your PDF from Google Drive.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="A short description of the PDF content."
                  {...field}
                  className="border-primary/30 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Adding...' : 'Add PDF Link'}
        </Button>
      </form>
    </Form>
  );
}