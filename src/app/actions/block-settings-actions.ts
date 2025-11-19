
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const BlockSettingsSchema = z.object({
  animationSpeed: z.coerce.number().min(1).max(100),
});

export async function updateBlockSettings(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }
  
  const validatedFields = BlockSettingsSchema.safeParse({
    animationSpeed: formData.get('animationSpeed'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    const settingsRef = db.collection('settings').doc('blocks');

    const settingsData = {
        ...validatedFields.data,
        updatedAt: Timestamp.now(),
    };

    await settingsRef.set(settingsData, { merge: true });

    revalidatePath('/');

    return { success: `Block settings updated successfully.` };
  } catch (e: any) {
    return { error: e.message };
  }
}
