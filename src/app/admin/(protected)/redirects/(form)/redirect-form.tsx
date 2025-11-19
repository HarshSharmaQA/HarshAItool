
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Redirect } from "@/lib/types";
import { createRedirect, updateRedirect } from "@/app/actions/redirect-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const redirectFormSchema = z.object({
  source: z.string().min(1, "Source path is required").startsWith('/', "Source must start with a '/'"),
  destination: z.string().min(1, "Destination path is required"),
  type: z.enum(['301', '302']),
  openInNewTab: z.boolean().optional(),
});

type RedirectFormValues = z.infer<typeof redirectFormSchema>;

interface RedirectFormProps {
  redirect?: Redirect | null;
}

export default function RedirectForm({ redirect }: RedirectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues: {
      source: redirect?.source || "",
      destination: redirect?.destination || "",
      type: redirect?.type || "301",
      openInNewTab: redirect?.openInNewTab || false,
    },
  });

  async function onSubmit(data: RedirectFormValues) {
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
          if (value !== undefined) {
             formData.append(key, typeof value === 'boolean' ? (value ? 'on' : 'off') : value);
          }
        });

        const result = redirect
          ? await updateRedirect(idToken, redirect.id, formData)
          : await createRedirect(idToken, formData);

        if (result?.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: redirect ? "Redirect updated successfully." : "Redirect created successfully.",
          });
          router.push("/admin/redirects");
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
        <CardTitle>{redirect ? "Edit Redirect" : "Create Redirect"}</CardTitle>
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
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Path</FormLabel>
                  <FormControl>
                    <Input placeholder="/old-page-url" {...field} />
                  </FormControl>
                  <FormDescription>The path you want to redirect from.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Path</FormLabel>
                  <FormControl>
                    <Input placeholder="/new-page-url or https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>The path or URL you want to redirect to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Redirect Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select a redirect type" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="301">301 - Permanent</SelectItem>
                                  <SelectItem value="302">302 - Temporary</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormDescription>301 for permanent moves, 302 for temporary ones.</FormDescription>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                control={form.control}
                name="openInNewTab"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-fit">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Open in new tab
                      </FormLabel>
                      <FormDescription>
                        If checked, the link will open in a new browser tab.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {redirect ? "Update Redirect" : "Create Redirect"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
