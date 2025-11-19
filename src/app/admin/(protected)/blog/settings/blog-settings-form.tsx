"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { BlogSettings, Post } from "@/lib/types";
import { updateBlogSettings } from "@/app/actions/blog-settings-actions";
import { Loader2, AlertCircle, GripVertical } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const blogSettingsSchema = z.object({
  listingType: z.enum(['dynamic', 'manual']),
  manualOrder: z.array(z.object({
    id: z.string()
  })),
  layout: z.enum(['grid', 'list']),
});

type BlogSettingsFormValues = z.infer<typeof blogSettingsSchema>;

interface BlogSettingsFormProps {
  settings: BlogSettings;
  posts: Post[];
}

export default function BlogSettingsForm({ settings, posts }: BlogSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultOrderedPosts = settings.manualOrder.length > 0
    ? settings.manualOrder.map(id => posts.find(p => p.id === id)).filter(Boolean) as Post[]
    : [];

  const remainingPosts = posts.filter(p => !settings.manualOrder.includes(p.id));
  
  const initialManualOrder = [...defaultOrderedPosts, ...remainingPosts];

  const form = useForm<BlogSettingsFormValues>({
    resolver: zodResolver(blogSettingsSchema),
    defaultValues: {
      listingType: settings.listingType || 'dynamic',
      manualOrder: initialManualOrder.map(p => ({ id: p.id })),
      layout: settings.layout || 'grid',
    },
  });
  
  const { fields, move } = useFieldArray({
    control: form.control,
    name: "manualOrder",
  });
  
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("draggedIndex"), 10);
    move(draggedIndex, dropIndex);
  };
  
  const listingType = form.watch("listingType");

  async function onSubmit(data: BlogSettingsFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('listingType', data.listingType);
      formData.append('manualOrder', JSON.stringify(data.manualOrder.map(item => item.id)));
      formData.append('layout', data.layout);
      
      const result = await updateBlogSettings(idToken, formData);

      if (result.error) {
        setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: result.success,
        });
        router.refresh();
      }
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const postMap = new Map(posts.map(p => [p.id, p]));

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
        <Card>
          <CardHeader>
            <CardTitle>Blog Listing Settings</CardTitle>
            <CardDescription>Control how blog posts are displayed on your main blog page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Blog Page Layout</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="grid" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Grid Layout
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="list" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          List Layout
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                   <FormDescription>Choose how you want to display your blog posts.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />

            <FormField
              control={form.control}
              name="listingType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Post Ordering</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dynamic" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Dynamic (newest first)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="manual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Manual
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {listingType === 'manual' && (
              <div className="space-y-4 pt-4 border-t">
                <FormLabel>Manual Post Order</FormLabel>
                <FormDescription>Drag and drop posts to set their display order.</FormDescription>
                <div className="space-y-2">
                  {fields.map((field, index) => {
                     const post = postMap.get(field.id);
                     if (!post) return null;
                     return (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20"
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDrop={(e) => onDrop(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <div className="flex-1">
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.publishedAt?.seconds ? format(new Date(post.publishedAt.seconds * 1000), "MMM d, yyyy") : 'Draft'}
                          </p>
                        </div>
                        <Badge variant={post.status === 'public' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                     )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}