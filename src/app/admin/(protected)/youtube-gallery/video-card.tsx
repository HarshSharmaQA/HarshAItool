
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Trash2, Loader2, Eye } from 'lucide-react';
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
import type { YouTubeVideo } from '@/lib/types';
import { useUser } from '@/components/providers/app-providers';
import { useToast } from '@/hooks/use-toast';
import { deleteYouTubeVideo } from '@/app/actions/youtube-actions';

interface VideoCardProps {
  video: YouTubeVideo;
  onDeleted: (id: string) => void;
  onView: () => void;
}

export default function VideoCard({ video, onDeleted, onView }: VideoCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unauthorized' });
      return;
    }
    setIsDeleting(true);
    try {
      const idToken = await user.getIdToken();
      const result = await deleteYouTubeVideo(idToken, video.id);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Success', description: 'Video deleted successfully.' });
        onDeleted(video.id);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div 
            className="relative aspect-video overflow-hidden rounded-t-lg cursor-pointer"
            onClick={onView}
        >
            <Image
                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
            />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Video className="h-12 w-12 text-white" />
            </div>
        </div>
        <CardHeader>
            <CardTitle className="text-lg leading-tight line-clamp-2">{video.title}</CardTitle>
            {video.description && (
                <CardDescription className="text-sm text-muted-foreground line-clamp-2 pt-1">{video.description}</CardDescription>
            )}
        </CardHeader>
        <CardFooter className="mt-auto flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="mr-2 h-4 w-4" /> View
            </Button>
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
                        This will permanently delete the video record.
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
      </CardFooter>
    </Card>
  );
}
