
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-initialization';
import { isAdmin } from '@/lib/auth-server';

const PdfSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  fileUrl: z.string().url('A valid file URL is required'),
  description: z.string().optional(),
  uploader: z.string().min(1, 'Uploader name is required'),
  category: z.string().optional(),
});


export async function createPdf(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    fileUrl: formData.get('fileUrl'),
    description: formData.get('description'),
    uploader: formData.get('uploader'),
    category: formData.get('category'),
  }

  const validatedFields = PdfSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const pdfsCollection = db.collection('pdfGallery');
    const data = {
      ...validatedFields.data,
      uploadDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await pdfsCollection.add(data);
    revalidatePath('/admin/pdf-gallery');
    revalidatePath('/pdf-gallery');
    return { success: 'PDF link added successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePdf(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!(await isAdmin(idToken, admin))) {
      return { error: 'Unauthorized' };
    }
  
    try {
      await db.collection('pdfGallery').doc(id).delete();
      revalidatePath('/admin/pdf-gallery');
      revalidatePath('/pdf-gallery');
      return { success: 'PDF deleted successfully.' };
    } catch (e: any) {
      return { error: e.message };
    }
  }

export async function updatePdf(idToken: string, id: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    title: formData.get('title'),
    fileUrl: formData.get('fileUrl'),
    description: formData.get('description'),
    category: formData.get('category'),
  }

  const validatedFields = PdfSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const pdfsCollection = db.collection('pdfGallery');
    const data = {
      ...validatedFields.data,
      updatedAt: Timestamp.now(),
    };
    await pdfsCollection.doc(id).update(data);
    revalidatePath('/admin/pdf-gallery');
    revalidatePath('/pdf-gallery');
    return { success: 'PDF updated successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}
