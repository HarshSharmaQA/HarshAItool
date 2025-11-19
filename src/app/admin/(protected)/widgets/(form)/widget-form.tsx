
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Widget } from "@/lib/types";
import { createWidget, updateWidget } from "@/app/actions/widget-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";

const widgetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes, e.g., 'my-widget'"),
  content: z.string().min(1, "Content is required"),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

interface WidgetFormProps {
  widget?: Widget | null;
}

export default function WidgetForm({ widget }: WidgetFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      title: widget?.title || "",
      slug: widget?.slug || "",
      content: widget?.content || "",
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && !widget) { // Only auto-slug for new widgets
        form.setValue('slug', generateSlug(value.title || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, widget]);

  async function onSubmit(data: WidgetFormValues) {
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
            formData.append(key, value);
        });

        const result = widget
          ? await updateWidget(idToken, widget.id, formData)
          : await createWidget(idToken, formData);

        if (result?.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: widget ? "Widget updated successfully." : "Widget created successfully.",
          });
          router.push("/admin/widgets");
          router.refresh();
        }
    } catch (error: any) {
        setFormError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{widget ? "Edit Widget" : "Create Widget"}</CardTitle>
        <CardDescription>Widgets are reusable blocks of content. Use the shortcode in your page or post editor to embed it.</CardDescription>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Widget" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive title for the widget (for internal use).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-widget" {...field} />
                  </FormControl>
                  <FormDescription>The unique identifier used in the shortcode.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="<p>Your reusable HTML content here.</p>"
                      className="min-h-[300px] font-code"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The HTML content to be injected when the shortcode is used.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {widget ? "Update Widget" : "Create Widget"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
