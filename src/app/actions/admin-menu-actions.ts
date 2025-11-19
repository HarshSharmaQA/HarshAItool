
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const linkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Link label is required"),
  href: z.string().min(1, "Link href is required"),
  icon: z.string().min(1, "Icon is required"),
  order: z.number(),
  external: z.boolean().optional(),
});

const AdminMenuSchema = z.object({
  links: z.array(linkSchema),
});

export async function updateAdminMenu(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }
  
  const rawData = {
    links: JSON.parse(formData.get('links') as string),
  };
  
  const validatedFields = AdminMenuSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }
  
  const { links } = validatedFields.data;

  try {
    const batch = db.batch();
    const menuCollection = db.collection('adminMenu');
    
    // Delete existing menu items
    const snapshot = await menuCollection.get();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Add new menu items
    links.forEach((link, index) => {
        const docRef = menuCollection.doc(link.id);
        batch.set(docRef, { ...link, order: index });
    });

    await batch.commit();

    revalidatePath('/admin', 'layout');

    return { success: `Admin menu updated successfully.` };
  } catch (e: any) {
      return { error: e.message };
  }
}
