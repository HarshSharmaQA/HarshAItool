
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from "@/firebase/server-initialization";
import { isAdmin } from "@/lib/auth-server";

const CouponSchema = z.object({
  code: z.string().min(1, "Code is required").regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only."),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, "Value must be a positive number"),
  status: z.enum(['active', 'inactive']),
});

export async function createCoupon(idToken: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CouponSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const couponsCollection = db.collection("coupons");
        
        // Check for duplicate code
        const codeCheck = await couponsCollection.where('code', '==', validatedFields.data.code).get();
        if (!codeCheck.empty) {
            return { error: "A coupon with this code already exists." };
        }

        const data = { 
            ...validatedFields.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        await couponsCollection.add(data);

        revalidatePath('/admin/marketing/coupons');
        return { success: "Coupon created successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateCoupon(idToken: string, id: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CouponSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const couponRef = db.collection('coupons').doc(id);

        const existingCoupon = (await couponRef.get()).data();
        if (existingCoupon?.code !== validatedFields.data.code) {
            const slugCheck = await db.collection("coupons").where('code', '==', validatedFields.data.code).get();
            if (!slugCheck.empty) {
                return { error: "A coupon with this code already exists." };
            }
        }
        
        const data = { 
            ...validatedFields.data,
            updatedAt: Timestamp.now()
        };
        await couponRef.update(data);
        
        revalidatePath('/admin/marketing/coupons');
        return { success: "Coupon updated successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteCoupon(idToken: string, id: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const couponRef = db.collection('coupons').doc(id);
        await couponRef.delete();
        revalidatePath('/admin/marketing/coupons');
        return { success: "Coupon deleted successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function validateCoupon(code: string): Promise<{ valid: boolean; coupon?: any; error?: string }> {
    const { db } = initializeFirebase();
    try {
        const couponsRef = db.collection('coupons');
        const snapshot = await couponsRef.where('code', '==', code.toUpperCase()).where('status', '==', 'active').limit(1).get();

        if (snapshot.empty) {
            return { valid: false, error: "Invalid or inactive coupon code." };
        }

        const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        return { valid: true, coupon };
    } catch (error: any) {
        return { valid: false, error: 'Could not validate coupon.' };
    }
}
