
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin, getAuthenticatedUser } from "@/lib/auth-server";

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
  automatic: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  showScroll: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  showSocial: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
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


const BlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  urlSlug: z.string().min(1, "URL Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  status: z.enum(['draft', 'public', 'scheduled']),
  isFavorite: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  isFeatured: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  categories: z.string().optional(),
  customCss: z.string().optional(),
  customHeadContent: z.string().optional(),
  customSchema: z.string().optional(),
  faqs: z.string().optional(),
  featuredImage: z.string().optional(),
  showRelatedPosts: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  relatedPostsSelection: z.enum(['latest', 'manual']).optional(),
  manualRelatedPosts: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  blocks: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
});

const processCategories = (categoriesString?: string): string[] => {
    if (!categoriesString) return [];
    return categoriesString.split(',').map(cat => cat.trim()).filter(Boolean);
};

export async function createBlog(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();

    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const user = await getAuthenticatedUser(idToken, admin);
    if (!user) {
        return { error: "You must be logged in to create a blog post." };
    }

    const validatedFields = BlogSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    const { faqs, featuredImage, categories, manualRelatedPosts, blocks, ...blogData } = validatedFields.data;

    try {
        const blogsCollection = db.collection("posts");
        
        const data = { 
            ...blogData,
            publishedAt: blogData.publishedAt ? Timestamp.fromDate(new Date(blogData.publishedAt)) : Timestamp.now(),
            categories: processCategories(categories),
            faqs: faqs ? JSON.parse(faqs) : [],
            featuredImage: featuredImage ? JSON.parse(featuredImage) : null,
            manualRelatedPosts: manualRelatedPosts ? JSON.parse(manualRelatedPosts) : [],
            blocks: blocks ? JSON.parse(blocks) : [],
            author: user.displayName || user.email,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        await blogsCollection.add(data);

        revalidatePath('/blog');
        revalidatePath(`/blog/${validatedFields.data.urlSlug}`);
        return { success: "Blog created successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateBlog(idToken: string, id: string, formData: FormData) {
    const { db, admin } = initializeFirebase();

    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = BlogSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }
    
    const { faqs, featuredImage, categories, manualRelatedPosts, blocks, ...blogData } = validatedFields.data;

    try {
        const blogRef = db.collection('posts').doc(id);
        
        const existingBlogSnap = await blogRef.get();
        if (!existingBlogSnap.exists) {
            return { error: "Post not found." };
        }
        const existingBlog = existingBlogSnap.data();
        
        const data = { 
            ...blogData,
            publishedAt: blogData.publishedAt ? Timestamp.fromDate(new Date(blogData.publishedAt)) : existingBlog?.publishedAt || Timestamp.now(),
            categories: processCategories(categories),
            faqs: faqs ? JSON.parse(faqs) : [],
            featuredImage: featuredImage ? JSON.parse(featuredImage) : null,
            manualRelatedPosts: manualRelatedPosts ? JSON.parse(manualRelatedPosts) : [],
            blocks: blocks ? JSON.parse(blocks) : [],
            updatedAt: Timestamp.now()
        };
        await blogRef.update(data);
        
        if (existingBlog && existingBlog.urlSlug !== validatedFields.data.urlSlug) {
            revalidatePath(`/blog/${existingBlog.urlSlug}`);
        }

        revalidatePath('/blog');
        revalidatePath(`/blog/${validatedFields.data.urlSlug}`);
        return { success: "Blog updated successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteBlog(idToken: string, id: string, slug: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const blogRef = db.collection('posts').doc(id);
        
        await blogRef.delete();
        revalidatePath('/blog');
        revalidatePath(`/blog/${slug}`);
        return { success: "Blog deleted successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}
