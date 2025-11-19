

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-initialization';
import { isAdmin } from '@/lib/auth-server';
import type { Order } from '@/lib/types';

const orderStatusSchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']),
});

const orderTrackingSchema = z.object({
    trackingNumber: z.string().optional(),
    shippingProvider: z.string().optional(),
    shippingProviderUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export async function updateOrderStatus(idToken: string, orderId: string, status: Order['status']) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }

  const validatedStatus = orderStatusSchema.safeParse({ status });

  if (!validatedStatus.success) {
    return { error: 'Invalid status' };
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      status: validatedStatus.data.status,
      updatedAt: Timestamp.now(),
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order/${orderId}`);

    return { success: `Order status updated to ${status}.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateOrderTracking(idToken: string, orderId: string, formData: FormData) {
  const { db, admin } = initializeFirebase();
  if (!(await isAdmin(idToken, admin))) {
    return { error: 'Unauthorized' };
  }
  
  const validatedFields = orderTrackingSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid tracking details', details: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      ...validatedFields.data,
      updatedAt: Timestamp.now(),
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order/${orderId}`);

    return { success: 'Tracking information updated.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteOrder(idToken: string, orderId: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.delete();
        
        revalidatePath('/admin/orders');
        return { success: "Order deleted successfully" };
    } catch (e: any) {
        return { error: e.message };
    }
}

    