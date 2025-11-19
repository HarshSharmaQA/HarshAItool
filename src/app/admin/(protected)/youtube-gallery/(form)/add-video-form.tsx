
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
import { Loader2, Youtube, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createYouTubeVideo } from '@/app/actions/youtube-actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { YouTubeVideo } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  videoId: z.string().min(11, 'Invalid YouTube Video ID.').max(11, 'Invalid YouTube Video ID.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddVideoForm({ onVideoAdded }: { onVideoAdded: (video: YouTubeVideo) => void }) {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { videoId: '', title: '', description: '' },
  });

  const videoId = form.watch('videoId');

  async function onSubmit(data: FormValues) {
    if (!user || !isAdmin) {
      setFormError('You must be an admin to add videos.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
        const idToken = await user.getIdToken();
        const formData = new FormData();
        formData.append('videoId', data.videoId);
        formData.append('title', data.title);
        formData.append('description', data.description || '');

        const result = await createYouTubeVideo(idToken, formData);

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
                description: 'YouTube video has been added successfully.',
            });
            form.reset();
            onVideoAdded(result.video as YouTubeVideo);
        }
    } catch (error: any) {
        setFormError('An error occurred while saving the video.');
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
        <h2 className="text-2xl font-semibold tracking-tight">Add New YouTube Video</h2>
         {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="videoId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>YouTube Video ID</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., dQw4w9WgXcQ" {...field} />
                        </FormControl>
                        <FormDescription>
                            The 11-character ID from the YouTube URL.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="My Awesome Video" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {videoId && videoId.length === 11 && (
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            )}
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description of the video content."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Youtube className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Adding...' : 'Add Video'}
        </Button>
      </form>
    </Form>
  );
}
