
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const SubscriberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export async function createSubscription(formData: FormData) {
    const { db } = initializeFirebase();

    const validatedFields = SubscriberSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    const { name, email } = validatedFields.data;

    try {
        const subscribersCollection = db.collection("subscribers");
        
        const data = { 
            name,
            email,
            subscribedAt: Timestamp.now(),
        };

        await subscribersCollection.add(data);
        
        revalidatePath('/admin/subscribers');

        return { success: "You have been subscribed successfully!" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteSubscriber(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const subscriberRef = db.collection('subscribers').doc(id);
        await subscriberRef.delete();
        revalidatePath('/admin/subscribers');
        return { success: "Subscriber deleted successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}
