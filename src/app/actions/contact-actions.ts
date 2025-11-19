

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  captcha: z.string().min(1, "CAPTCHA is required."),
  num1: z.coerce.number(),
  num2: z.coerce.number(),
});

export async function createContactSubmission(formData: FormData) {
    const { db } = initializeFirebase();

    const validatedFields = ContactSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    const { captcha, num1, num2, ...contactData } = validatedFields.data;

    if (parseInt(captcha, 10) !== num1 + num2) {
      return { error: "Incorrect CAPTCHA answer. Please try again." };
    }


    try {
        const contactsCollection = db.collection("contacts");
        
        const data = { 
            ...contactData,
            submittedAt: Timestamp.now(),
        };

        await contactsCollection.add(data);
        
        revalidatePath('/admin/contacts');

        return { success: "Your message has been sent successfully!" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteContactSubmission(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const contactRef = db.collection('contacts').doc(id);
        
        await contactRef.delete();
        revalidatePath('/admin/contacts');
        return { success: "Submission deleted successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}
