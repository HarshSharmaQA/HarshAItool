
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-initialization';
import { isAdmin } from '@/lib/auth-server';
import type { YouTubeVideo } from '@/lib/types';

const YouTubeVideoSchema = z.object({
  videoId: z.string().min(11, 'Invalid YouTube Video ID.').max(11, 'Invalid YouTube Video ID.'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export async function createYouTubeVideo(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    videoId: formData.get('videoId'),
    title: formData.get('title'),
    description: formData.get('description'),
  }

  const validatedFields = YouTubeVideoSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const videosCollection = db.collection('youtubeVideos');
    const data = {
      ...validatedFields.data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await videosCollection.add(data);
    
    revalidatePath('/admin/youtube-gallery');
    revalidatePath('/youtube-gallery');
    
    const newVideo = { id: docRef.id, ...data } as YouTubeVideo;

    return { success: 'YouTube video added successfully.', video: newVideo };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteYouTubeVideo(idToken: string, id: string) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.collection('youtubeVideos').doc(id).delete();
    revalidatePath('/admin/youtube-gallery');
    revalidatePath('/youtube-gallery');
    return { success: 'YouTube video deleted successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}
