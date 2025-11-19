
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { initializeFirebase } from "@/firebase/server-initialization";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from 'firebase-admin/firestore';
import { getAuthenticatedUser, isAdmin } from "@/lib/auth-server";
import { MASTER_ADMIN_EMAIL } from "@/lib/auth-constants";

const ProfileSchema = z.object({
  displayName: z.string().min(1, "Display Name is required"),
});

export async function updateUserProfile(idToken: string, uid: string, formData: FormData) {
    const { db, admin } = initializeFirebase();
    try {
        const currentUser = await getAuthenticatedUser(idToken, admin);
        const userIsAdmin = await isAdmin(idToken, admin);
        
        const canUpdate = userIsAdmin || (currentUser && currentUser.uid === uid);
        
        if (!canUpdate) {
            return { error: "Unauthorized" };
        }

        const validatedFields = ProfileSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
          return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
        }
        
        const { displayName } = validatedFields.data;

        await getAuth(admin).updateUser(uid, { displayName });
        
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update({
            displayName,
            updatedAt: Timestamp.now(),
        });
        
        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/edit/${uid}`);
        revalidatePath('/admin/dashboard');
        return { success: 'Profile updated successfully.' };

    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteUser(idToken: string, uid: string) {
    const { db, admin } = initializeFirebase();
    const userIsAdmin = await isAdmin(idToken, admin);
    if (!userIsAdmin) {
        return { error: "Unauthorized" };
    }

    try {
        // Prevent master admin from being deleted
        const userToDelete = await getAuth(admin).getUser(uid);
        if (userToDelete.email === MASTER_ADMIN_EMAIL) {
            return { error: "The master admin account cannot be deleted." };
        }

        // Delete from Firebase Auth
        await getAuth(admin).deleteUser(uid);

        // Delete from Firestore
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.delete();

        revalidatePath('/admin/users');
        return { success: "User deleted successfully." };

    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { error: error.message };
    }
}


export async function updateUserRole(idToken: string, uid: string, role: 'admin' | 'user') {
    const { db, admin } = initializeFirebase();
    const userIsAdmin = await isAdmin(idToken, admin);
    if (!userIsAdmin) {
      return { error: 'Unauthorized' };
    }
  
    try {
      const auth = getAuth(admin);
  
      // Prevent changing the role of the master admin
      const userToUpdate = await auth.getUser(uid);
      if (userToUpdate.email === MASTER_ADMIN_EMAIL) {
        return { error: 'The master admin role cannot be changed.' };
      }
  
      // Set the custom claim
      await auth.setCustomUserClaims(uid, { role });
  
      // Update the role in the Firestore document
      const userDocRef = db.collection('users').doc(uid);
      await userDocRef.update({
        role: role,
        updatedAt: Timestamp.now(),
      });
  
      // Revoke the user's refresh tokens to force re-authentication for the new claims to take effect.
      await auth.revokeRefreshTokens(uid);
  
      revalidatePath('/admin/users');
      return { success: `User role updated to ${role}.` };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { error: error.message };
    }
  }
  
  export async function approveUser(idToken: string, uid: string) {
    const { db, admin } = initializeFirebase();
    if (!await isAdmin(idToken, admin)) {
        return { error: "Unauthorized" };
    }

    try {
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update({
            approved: true,
            updatedAt: Timestamp.now(),
        });

        revalidatePath('/admin/users');
        return { success: 'User approved successfully.' };
    } catch (e: any) {
        return { error: e.message };
    }
}
