
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const linkSchema: z.ZodType<any> = z.object({
  id: z.string(),
  label: z.string().min(1, "Link label is required"),
  path: z.string().optional(),
  order: z.number(),
  isGroup: z.boolean().optional(),
  links: z.array(z.lazy(() => linkSchema)).optional(),
}).refine(data => {
    if (data.isGroup) {
      return true; // Path is optional for groups
    }
    return typeof data.path === 'string' && data.path.length > 0; // Path is required for non-groups
}, {
    message: "Path is required for non-group items.",
    path: ['path'],
});


const MenuSchema = z.object({
  id: z.enum(["header", "footer"]),
  title: z.string().optional(),
  links: z.array(linkSchema),
});

export async function updateMenu(idToken: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!await isAdmin(idToken, admin)) {
    return { error: "Unauthorized" };
  }
  
  const rawData = {
    id: formData.get('id'),
    title: formData.get('title'),
    links: JSON.parse(formData.get('links') as string),
  };
  
  const validatedFields = MenuSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
  }
  
  const { id, links, title } = validatedFields.data;

  // Recursively assign order to links and their children
  const assignOrder = (links: any[]) => {
    return links.map((link, index) => {
      const newLink = { ...link, order: index };
      if (newLink.links && newLink.links.length > 0) {
        newLink.links = assignOrder(newLink.links);
      }
      return newLink;
    });
  };

  const orderedLinks = assignOrder(links);

  try {
    const menuRef = db.collection('menus').doc(id);

    const menuData: { [key: string]: any } = {
        id,
        links: orderedLinks,
        updatedAt: Timestamp.now(),
    };
    
    if (title) {
        menuData.title = title;
    }

    await menuRef.set(menuData, { merge: true });

    revalidatePath('/', 'layout');

    return { success: `${id.charAt(0).toUpperCase() + id.slice(1)} menu updated successfully.` };
  } catch (e: any) {
      return { error: e.message };
  }
}

