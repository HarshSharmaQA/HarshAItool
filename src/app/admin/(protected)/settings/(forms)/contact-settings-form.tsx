
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ContactSettings } from "@/lib/types";
import { updateContactSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, Mail, Phone, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";

const contactSettingsSchema = z.object({
  email: z.string().email("Invalid email format.").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;

interface ContactSettingsFormProps {
  settings: ContactSettings;
}

export default function ContactSettingsForm({ settings }: ContactSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();

  const form = useForm<ContactSettingsFormValues>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      email: settings.email || "",
      phone: settings.phone || "",
      address: settings.address || "",
    },
  });

  async function onSubmit(data: ContactSettingsFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const result = await updateContactSettings(idToken, formData);

      if (result.error) {
          setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: "Contact settings updated successfully.",
        });
        router.refresh();
      }
    } catch (error: any) {
        setFormError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
        <CardDescription>Manage the contact details displayed on your site.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Failed</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
            
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Mail className="h-4 w-4 mr-2" /> Email</FormLabel>
                <FormControl><Input placeholder="contact@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><Phone className="h-4 w-4 mr-2" /> Phone Number</FormLabel>
                <FormControl><Input placeholder="+1 (234) 567-890" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Address</FormLabel>
                <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Contact Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
