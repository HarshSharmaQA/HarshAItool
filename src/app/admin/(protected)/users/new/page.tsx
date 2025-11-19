
import { notFound } from "next/navigation";

export default function NewUserPage() {
    // This page is removed as user creation is now handled automatically on first sign-in.
    // Admins can manage roles, but not manually create users with passwords.
    notFound();
}
