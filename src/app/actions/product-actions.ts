

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-initialization';
import { isAdmin } from '@/lib/auth-server';

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer'),
  status: z.enum(['draft', 'published']),
  slug: z
    .string()
    .min(1, 'URL Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  image: z.string(), // Expecting a JSON string for the image object
  isFeatured: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
});

const processTags = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
};

export async function createProduct(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const validatedFields = ProductSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { image, tags, ...productData } = validatedFields.data;

  try {
    const productsCollection = db.collection('products');
    const data = {
      ...productData,
      image: JSON.parse(image),
      tags: processTags(tags),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await productsCollection.add(data);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: 'Product created successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateProduct(idToken: string, id: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const validatedFields = ProductSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { image, tags, ...productData } = validatedFields.data;

  try {
    const productRef = db.collection('products').doc(id);
    const data = {
      ...productData,
      image: JSON.parse(image),
      tags: processTags(tags),
      updatedAt: Timestamp.now(),
    };
    await productRef.update(data);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${productData.slug}`);
    return { success: 'Product updated successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteProduct(idToken: string, id: string, slug: string) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.collection('products').doc(id).delete();
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    return { success: 'Product deleted successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}
