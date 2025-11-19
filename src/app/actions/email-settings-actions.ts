
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-initialization';
import { isAdmin } from '@/lib/auth-server';

const EmailTemplateSchema = z.object({
  id: z.enum(['contact-form', 'new-subscriber', 'new-post']),
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function updateEmailTemplate(idToken: string, data: z.infer<typeof EmailTemplateSchema>) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const validatedFields = EmailTemplateSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { id, ...templateData } = validatedFields.data;
    const templateRef = db.collection('emailTemplates').doc(id);

    await templateRef.set(
      {
        ...templateData,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    revalidatePath('/admin/settings/email');
    return { success: 'Email template updated successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}
