


"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  answer: z.string(),
});

const featuredImageSchema = z.object({
    url: z.string(),
    hint: z.string(),
});

const featureItemSchema = z.object({
    id: z.string(),
    icon: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
});

const testimonialItemSchema = z.object({
    id: z.string(),
    quote: z.string().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
});

const galleryImageSchema = z.object({
    id: z.string(),
    url: z.string().optional(),
    alt: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
});

const logoItemSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  alt: z.string().optional(),
});

const bannerSlideSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const expandingCardItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  detailsLink: z.string().optional(),
});

const memberItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  role: z.string().min(1, "Role is required."),
  imageUrl: z.string().url("A valid image URL is required."),
  imageHint: z.string().optional(),
  linkedinUrl: z.string().url("A valid LinkedIn URL is required.").optional().or(z.literal('')),
});

const founderNoteSocialsSchema = z.object({
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
}).optional();

const addressSocialsSchema = z.object({
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
}).optional();

const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'features', 'cta', 'testimonial', 'posts', 'gallery', 'html', 'divider', 'expanding-cards', 'contact', 'logo-grid', 'founder-note', 'best-acf', 'banner', 'address', 'community', 'map', 'newsletter', 'banner-v2', 'leadership']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  html: z.string().optional(),
  selectionType: z.enum(['latest', 'favorite']).optional(),
  features: z.array(featureItemSchema).optional(),
  testimonials: z.array(testimonialItemSchema).optional(),
  images: z.array(galleryImageSchema).optional(),
  logos: z.array(logoItemSchema).optional(),
  preTitle: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  greeting: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  socials: z.union([founderNoteSocialsSchema, addressSocialsSchema]).optional(),
  view: z.enum(['grid', 'carousel']).optional(),
  scrollDirection: z.enum(['left', 'right']).optional(),
  slides: z.array(bannerSlideSchema).optional(),
  automatic: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  showScroll: z.boolean().optional(),
  showSocial: z.boolean().optional(),
  cards: z.array(expandingCardItemSchema).optional(),
  address: z.string().optional(),
  mapImageUrl: z.string().optional(),
  mapImageHint: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  layout: z.enum(['side-by-side', 'stacked']).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  phoneImageUrl: z.string().optional(),
  phoneImageHint: z.string().optional(),
  members: z.array(memberItemSchema).optional(),
});


const PageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  urlSlug: z.string().min(1, "URL Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  status: z.enum(['draft', 'public']),
  customCss: z.string().optional(),
  customHeadContent: z.string().optional(),
  customSchema: z.string().optional(),
  faqs: z.string().optional(),
  featuredImage: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  ctaOpenInNewTab: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  blocks: z.string().optional(),
});

export async function createPage(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }

  const validatedFields = PageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }
  
  const { faqs, featuredImage, blocks, ...pageData } = validatedFields.data;

  try {
    const pagesCollection = db.collection("pages");
    
    const data = { 
        ...pageData,
        faqs: faqs ? JSON.parse(faqs) : [],
        featuredImage: featuredImage ? JSON.parse(featuredImage) : null,
        blocks: blocks ? JSON.parse(blocks) : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };

    await pagesCollection.add(data);

    revalidatePath('/');
    revalidatePath('/[slug]', 'page');
    return { success: "Page created successfully" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updatePage(idToken: string, id: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }

  const validatedFields = PageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }

  const { faqs, featuredImage, blocks, ...pageData } = validatedFields.data;

  try {
    const pageRef = db.collection('pages').doc(id);

    const existingPageSnap = await pageRef.get();
    if (!existingPageSnap.exists) {
        return { error: "Page not found." };
    }
    const existingPage = existingPageSnap.data();

    const data = { 
      ...pageData,
      faqs: faqs ? JSON.parse(faqs) : [],
      featuredImage: featuredImage ? JSON.parse(featuredImage) : null,
      blocks: blocks ? JSON.parse(blocks) : [],
      updatedAt: Timestamp.now() 
    };
    await pageRef.update(data);
    
    if (existingPage && existingPage.urlSlug !== validatedFields.data.urlSlug) {
      revalidatePath(`/${existingPage.urlSlug}`);
    }

    revalidatePath('/');
    revalidatePath(`/${validatedFields.data.urlSlug}`);
    return { success: "Page updated successfully" };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function deletePage(idToken: string, id: string, slug: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const pageRef = db.collection('pages').doc(id);
        
        await pageRef.delete();
        revalidatePath('/');
        revalidatePath(`/${slug}`);
        return { success: "Page deleted successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}
