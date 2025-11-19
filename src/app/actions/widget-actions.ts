
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const WidgetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().min(1, "Content is required"),
});

export async function createWidget(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = WidgetSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const widgetsCollection = db.collection("widgets");
        
        // Check for duplicate slug
        const slugCheck = await widgetsCollection.where('slug', '==', validatedFields.data.slug).get();
        if (!slugCheck.empty) {
            return { error: "A widget with this slug already exists." };
        }

        const data = { 
            ...validatedFields.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        await widgetsCollection.add(data);

        revalidatePath('/admin/widgets');
        revalidatePath('/', 'layout'); // Revalidate all pages in case a widget was updated
        return { success: "Widget created successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateWidget(idToken: string, id: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = WidgetSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const widgetRef = db.collection('widgets').doc(id);

        // Check for duplicate slug (if changed)
        const existingWidget = (await widgetRef.get()).data();
        if (existingWidget?.slug !== validatedFields.data.slug) {
            const slugCheck = await db.collection("widgets").where('slug', '==', validatedFields.data.slug).get();
            if (!slugCheck.empty) {
                return { error: "A widget with this slug already exists." };
            }
        }
        
        const data = { 
            ...validatedFields.data,
            updatedAt: Timestamp.now()
        };
        await widgetRef.update(data);
        
        revalidatePath('/admin/widgets');
        revalidatePath('/', 'layout'); // Revalidate all pages
        return { success: "Widget updated successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteWidget(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const widgetRef = db.collection('widgets').doc(id);
        await widgetRef.delete();
        revalidatePath('/admin/widgets');
        revalidatePath('/', 'layout');
        return { success: "Widget deleted successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}
