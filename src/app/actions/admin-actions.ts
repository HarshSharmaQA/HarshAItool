
"use server";

import { revalidatePath } from "next/cache";
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";
import { cookies } from 'next/headers';

export async function clearCache() {
  const { admin } = initializeFirebase();
  const cookieStore = await cookies();
  const idToken = cookieStore.get('idToken')?.value;

  if (!idToken || !(await isAdmin(idToken, admin))) {
    return { error: "Unauthorized" };
  }

  try {
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
