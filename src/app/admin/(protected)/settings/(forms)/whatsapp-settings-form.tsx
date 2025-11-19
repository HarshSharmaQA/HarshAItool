
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import type { WhatsappSettings } from "@/lib/types";
import { updateWhatsappSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, MessageCircle, Trash2, Plus, GripVertical } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const whatsappSettingsSchema = z.object({
  enabled: z.boolean(),
  phoneNumber: z.string().min(1, "Phone number is required."),
  topics: z.array(z.object({ value: z.string().min(1, "Topic cannot be empty.") })),
});

type WhatsappSettingsFormValues = z.infer<typeof whatsappSettingsSchema>;

interface WhatsappSettingsFormProps {
  settings: WhatsappSettings;
}

export default function WhatsappSettingsForm({ settings }: WhatsappSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();

  const form = useForm<WhatsappSettingsFormValues>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: {
      enabled: settings?.enabled ?? true,
      phoneNumber: settings?.phoneNumber || "",
      topics: settings?.topics?.map(topic => ({ value: topic })) || [{ value: "General Inquiry" }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "topics",
  });

  async function onSubmit(data: WhatsappSettingsFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('enabled', data.enabled ? 'on' : 'off');
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('topics', JSON.stringify(data.topics.map(t => t.value)));

      const result = await updateWhatsappSettings(idToken, formData);

      if (result.error) {
          setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: "WhatsApp settings updated successfully.",
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
        <CardTitle>WhatsApp Button Settings</CardTitle>
        <CardDescription>Manage the floating WhatsApp chat button.</CardDescription>
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
            
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable WhatsApp Button</FormLabel>
                    <FormDescription>
                      Show the floating WhatsApp button on your site.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> Phone Number</FormLabel>
                <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                <FormDescription>Include the country code (e.g., +1 for USA).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <FormLabel>Message Topics</FormLabel>
              <FormDescription className="mb-4">Add predefined topics for users to select from.</FormDescription>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                     <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                     <FormField
                      control={form.control}
                      name={`topics.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Topic ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Topic
                </Button>
            </div>


            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save WhatsApp Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
