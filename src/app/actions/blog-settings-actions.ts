
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const BlogSettingsSchema = z.object({
  listingType: z.enum(['dynamic', 'manual']),
  manualOrder: z.array(z.string()),
  layout: z.enum(['grid', 'list']),
});

export async function updateBlogSettings(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }
  
  const manualOrderValue = formData.get('manualOrder') as string;

  const rawData = {
    listingType: formData.get('listingType'),
    manualOrder: manualOrderValue ? JSON.parse(manualOrderValue) : [],
    layout: formData.get('layout'),
  };
  
  const validatedFields = BlogSettingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    const settingsRef = db.collection('settings').doc('blog');

    const settingsData = {
        ...validatedFields.data,
        updatedAt: Timestamp.now(),
    };

    await settingsRef.set(settingsData, { merge: true });

    revalidatePath('/blog');

    return { success: `Blog settings updated successfully.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

    