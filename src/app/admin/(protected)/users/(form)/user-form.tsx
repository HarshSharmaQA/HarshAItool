
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/app/actions/user-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserProfile } from "@/lib/types";
import { useUser } from "@/components/providers/app-providers";

const userFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    user: UserProfile;
}

export default function UserForm({ user: userToEdit }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: userToEdit?.displayName || "",
    },
  });

  async function onSubmit(data: UserFormValues) {
    if (!currentUser) {
        setFormError("You must be logged in to perform this action.");
        return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
        const idToken = await currentUser.getIdToken();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const result = await updateUserProfile(idToken, userToEdit.uid, formData);

        if (result?.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: "User profile updated successfully.",
          });
          router.push("/admin/users");
          router.refresh();
        }
    } catch (error: any) {
        console.error("Form submission error:", error);
        setFormError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
            </Alert>
        )}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={userToEdit.email || ''} disabled />
            </FormItem>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}
