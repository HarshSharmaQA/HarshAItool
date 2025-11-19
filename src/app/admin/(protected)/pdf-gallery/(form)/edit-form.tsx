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
import { updatePdf } from '@/app/actions/pdf-actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { PDF } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.string().optional(),
  fileUrl: z.string().url('Please enter a valid URL.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditForm({ pdf, onEditComplete }: { pdf: PDF; onEditComplete: () => void }) {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: pdf.title || '',
      category: pdf.category || '',
      fileUrl: pdf.fileUrl || '',
      description: pdf.description || '',
    },
  });

  const fileUrl = form.watch('fileUrl');

  async function onSubmit(data: FormValues) {
    if (!user || !isAdmin) {
      setFormError('You must be an admin to edit PDFs.');
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

      const result = await updatePdf(idToken, pdf.id, formData);

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
          description: 'PDF has been updated successfully.',
        });
        onEditComplete();
      }
    } catch (error: any) {
      setFormError('An error occurred while updating the PDF data.');
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
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Edit PDF</h2>
         {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Edit Failed</AlertTitle>
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
              <FormLabel className="text-foreground">File URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="https://example.com/file.pdf"
                    {...field}
                    className="border-primary/30 focus-visible:ring-primary"
                  />
                </FormControl>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(fileUrl, '_blank')}
                    aria-label="Preview PDF"
                    disabled={!fileUrl}
                    className="border-primary/30 hover:bg-primary/10"
                >
                    <Eye className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <FormDescription>
                The URL to the PDF file.
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onEditComplete} className="border-primary/30 hover:bg-primary/10">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Updating...' : 'Update PDF'}
          </Button>
        </div>
      </form>
    </Form>
  );
}