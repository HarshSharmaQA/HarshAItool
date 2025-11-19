"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const RedirectSchema = z.object({
  source: z.string().min(1, "Source path is required").startsWith('/', "Source must start with a '/'"),
  destination: z.string().min(1, "Destination path is required"),
  type: z.enum(['301', '302']),
  openInNewTab: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
});

export async function createRedirect(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = RedirectSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const redirectsCollection = db.collection("redirects");
        
        const data = { 
            ...validatedFields.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        await redirectsCollection.add(data);

        revalidatePath('/admin/redirects');
        // This won't trigger a next.config.js reload automatically in dev, but is good practice for production builds
        return { success: "Redirect created successfully. Changes may take a few moments to apply." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateRedirect(idToken: string, id: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = RedirectSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const redirectRef = db.collection('redirects').doc(id);
        
        const data = { 
            ...validatedFields.data,
            updatedAt: Timestamp.now()
        };
        await redirectRef.update(data);
        
        revalidatePath('/admin/redirects');
        return { success: "Redirect updated successfully. Changes may take a few moments to apply." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteRedirect(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const redirectRef = db.collection('redirects').doc(id);
        await redirectRef.delete();
        revalidatePath('/admin/redirects');
        return { success: "Redirect deleted successfully. Changes may take a few moments to apply." };
    } catch (e: any) {
        return { error: e.message };
    }
}
