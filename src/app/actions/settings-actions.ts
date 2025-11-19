
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const SettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site Title is required").optional(),
  siteDescription: z.string().min(1, "Site Description is required").optional(),
  siteLogoUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  faviconUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  googleAnalyticsId: z.string().optional(),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialLinkedin: z.string().url().optional().or(z.literal('')),
  socialYoutube: z.string().url().optional().or(z.literal('')),
  customHeadContent: z.string().optional(),
  copyrightText: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system', 'dramatic']).optional(),
  currency: z.string().max(5).optional(),
});

const ContactSettingsSchema = z.object({
    email: z.string().email("Invalid email format.").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
});

const WhatsappSettingsSchema = z.object({
    enabled: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    phoneNumber: z.string().min(1, "Phone number is required."),
    topics: z.string().transform((val) => JSON.parse(val)),
});

const MarqueeItemSchema = z.object({
    id: z.string(),
    text: z.string().min(1, "Text cannot be empty."),
    icon: z.string().optional(),
});

const MarqueeSettingsSchema = z.object({
    enabled: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    speed: z.coerce.number().min(1).max(100),
    direction: z.enum(['left', 'right']).optional(),
    items: z.string().transform((val) => JSON.parse(val)).pipe(z.array(MarqueeItemSchema)),
});

const NotificationPopupSchema = z.object({
  enabled: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
  title: z.string().optional(),
  message: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  delaySeconds: z.coerce.number().min(0).optional(),
  dismissalDuration: z.enum(['session', 'day', 'week']).optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});


export async function updateSettings(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }
    
    const validatedFields = SettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const data = { 
            ...validatedFields.data, 
            updatedAt: Timestamp.now()
        };

        const settingsRef = db.collection("settings").doc("global");
        await settingsRef.set(data, { merge: true });

        revalidatePath('/', 'layout');
        return { success: "Settings updated successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateContactSettings(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }
    
    const validatedFields = ContactSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const data = { 
            ...validatedFields.data, 
            updatedAt: Timestamp.now()
        };

        const settingsRef = db.collection("settings").doc("contact");
        await settingsRef.set(data, { merge: true });

        revalidatePath('/contact');
        revalidatePath('/admin/settings/global');
        return { success: "Contact settings updated successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateWhatsappSettings(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }
    
    const validatedFields = WhatsappSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const data = { 
            ...validatedFields.data, 
            updatedAt: Timestamp.now()
        };

        const settingsRef = db.collection("settings").doc("whatsapp");
        await settingsRef.set(data, { merge: true });

        revalidatePath('/', 'layout');
        return { success: "WhatsApp settings updated successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateMarqueeSettings(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = MarqueeSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        
      return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const data = { 
            ...validatedFields.data, 
            updatedAt: Timestamp.now()
        };

        const settingsRef = db.collection("settings").doc("marquee");
        await settingsRef.set(data, { merge: true });

        revalidatePath('/', 'layout');
        return { success: "Marquee settings updated successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateNotificationPopupSettings(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: "Unauthorized" };
  }

  const validatedFields = NotificationPopupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = {
      ...validatedFields.data,
      updatedAt: Timestamp.now(),
    };

    const settingsRef = db.collection("settings").doc("notificationPopup");
    await settingsRef.set(data, { merge: true });

    revalidatePath("/", "layout");
    return { success: "Notification popup settings updated successfully" };
  } catch (e: any) {
    return { error: e.message };
  }
}
