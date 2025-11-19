'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertCircle, Plus, Trash2, GripVertical, Image as ImageIcon, Code, MessageSquareQuote, Newspaper, Minus, CodeXml, Star, Move, Mail, Building2, User, Users, Tv, Film, ChevronDown, Linkedin, Twitter, Facebook, Instagram, Globe, Map, Phone, Mailbox, ExternalLink, Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Wand2 } from 'lucide-react';
import type { Post } from '@/lib/types';
import { createBlog, updateBlog } from '@/app/actions/blog-actions';
import { getContentSuggestions } from '@/ai/flows/content-suggestions';
import { humanizeContent } from '@/ai/flows/humanize-content';
import { useUser } from '@/components/providers/app-providers';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Question is required."),
  answer: z.string().min(1, "Answer is required."),
});

const featuredImageSchema = z.object({
    url: z.string().url("Must be a valid URL.").or(z.literal("")),
    hint: z.string().optional(),
});

const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  urlSlug: z.string().min(2, {
    message: "URL Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes, e.g., 'my-post'"),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.boolean().optional(),
  status: z.enum(['draft', 'public', 'scheduled']),
  customCss: z.string().optional(),
  customHeadContent: z.string().optional(),
  customSchema: z.string().optional(),
  faqs: z.array(faqSchema).optional(),
  featuredImage: featuredImageSchema.optional(),
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface BlogFormProps {
  post?: Post | null;
  allPosts?: Post[];
}

export default function BlogForm({ post, allPosts = [] }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || "",
      urlSlug: post?.urlSlug || "",
      content: post?.content || "",
      seoTitle: post?.seoTitle || "",
      seoDescription: post?.seoDescription || "",
      seoKeywords: post?.seoKeywords || "",
      canonicalUrl: post?.canonicalUrl || "",
      noIndex: post?.noIndex || false,
      status: post?.status || "draft",
      customCss: post?.customCss || "",
      customHeadContent: post?.customHeadContent || "",
      customSchema: post?.customSchema || "",
      faqs: post?.faqs || [],
      featuredImage: post?.featuredImage || { url: "", hint: "" },
      ctaTitle: post?.ctaTitle || "",
      ctaSubtitle: post?.ctaSubtitle || "",
      ctaText: post?.ctaText || "",
      ctaLink: post?.ctaLink || "",
      isFavorite: post?.isFavorite || false,
      isFeatured: post?.isFeatured || false,
      categories: post?.categories || [],
      author: post?.author || "",
      publishedAt: post?.publishedAt ? 
        (() => {
          try {
            // Handle different date formats
            const date = new Date(post.publishedAt);
            return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
          } catch (e) {
            return "";
          }
        })() : "",
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const featuredImageUrl = form.watch("featuredImage.url");

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
      if (name === 'title' && !post) { 
        form.setValue('urlSlug', generateSlug(value.title || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, post]);

  async function handleGetAiSuggestions() {
    setIsAiLoading(true);
    const content = form.getValues("content");
    const result = await getContentSuggestions({ existingContent: content });
    setAiSuggestions(result.suggestions);
    setIsAiLoading(false);
  }

  async function handleHumanizeContent() {
    const textarea = contentRef.current;
    if (!textarea) return;
  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullContent = form.getValues('content');
    const selectedText = fullContent.substring(start, end);
  
    if (!selectedText) {
      toast({
        variant: "destructive",
        title: "No text selected",
        description: "Please select the text you want to humanize.",
      });
      return;
    }
  
    setIsAiLoading(true);
    try {
      const result = await humanizeContent({ content: selectedText });
      if (result.humanizedContent) {
        const newContent =
          fullContent.substring(0, start) +
          result.humanizedContent +
          fullContent.substring(end);
        form.setValue('content', newContent, { shouldDirty: true, shouldValidate: true });
        
        // This makes sure the change is reflected in the textarea immediately
        // and keeps the new text selected.
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + result.humanizedContent.length);
        }, 0);

        toast({
          title: "Content Humanized",
          description: "The selected text has been rewritten.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to humanize content.",
      });
    } finally {
      setIsAiLoading(false);
    }
  }

  const applyTag = (tag: string, isBlock = false) => {
    const textarea = contentRef.current;
    if (!textarea) return;
  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = form.getValues('content');
    const selectedText = currentContent.substring(start, end);
  
    let newText;
    let taggedTextLength = 0;
    if (isBlock) {
      const lineStart = currentContent.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = currentContent.indexOf('\n', end);
      const effectiveEnd = lineEnd === -1 ? currentContent.length : lineEnd;
      
      let lineText = currentContent.substring(lineStart, effectiveEnd);
      
      const existingTagMatch = lineText.match(/^<([hH][2-4])>(.*)<\/\1>$/);
      if (existingTagMatch) {
        lineText = existingTagMatch[2];
      }

      const taggedText = `<${tag}>${lineText}</${tag}>`;
      taggedTextLength = taggedText.length;
      newText = currentContent.substring(0, lineStart) + taggedText + currentContent.substring(effectiveEnd);
    } else {
      const taggedText = `<${tag}>${selectedText}</${tag}>`;
      taggedTextLength = taggedText.length;
      newText = currentContent.substring(0, start) + taggedText + currentContent.substring(end);
    }
  
    form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });
    
    setTimeout(() => {
        textarea.focus();
        if (!isBlock) {
            textarea.setSelectionRange(start, start + taggedTextLength);
        } else {
            const lineStart = currentContent.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = newText.indexOf('\n', lineStart);
            const effectiveEnd = lineEnd === -1 ? newText.length : lineEnd;
            textarea.setSelectionRange(lineStart, effectiveEnd);
        }
    }, 0);
  };
  
  const applyList = (tag: 'ul' | 'ol') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.getValues('content');
    const selectedText = text.substring(start, end);
    const listItems = selectedText.split('\n').map(line => `  <li>${line}</li>`).join('\n');
    const list = `<${tag}>\n${listItems}\n</${tag}>`;
    const newText = text.substring(0, start) + list + text.substring(end);
    form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });
  };

  async function onSubmit(data: PostFormValues) {
    if (!user) {
        setFormError("You must be logged in to perform this action.");
        return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
        const idToken = await user.getIdToken();
        const formData = new FormData();
        
        (Object.keys(data) as Array<keyof typeof data>).forEach((key) => {
            const value = data[key];
            if (value !== null && value !== undefined) {
              if (key === 'faqs' || key === 'featuredImage' || key === 'categories') {
                formData.append(key, JSON.stringify(value));
              } else if (typeof value === 'boolean') {
                formData.append(key, value ? 'on' : 'off');
              } else {
                formData.append(key, value as string);
              }
            }
        });

        const result = post
          ? await updateBlog(idToken, post.id, formData)
          : await createBlog(idToken, formData);

        if (result.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: post ? "Post updated successfully." : "Post created successfully.",
          });
          router.push("/admin/blog");
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
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader><CardTitle>Content</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="My Awesome Post" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>
                                  <div className="flex justify-between items-center">
                                      <span>Content (HTML)</span>
                                        <div className="flex items-center gap-2">
                                          <Button type="button" variant="outline" size="sm" onClick={handleHumanizeContent} disabled={isAiLoading}>
                                              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                              Humanize
                                          </Button>
                                          <Button type="button" variant="outline" size="sm" onClick={handleGetAiSuggestions} disabled={isAiLoading}>
                                            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Suggestions
                                          </Button>
                                        </div>
                                  </div>
                                </FormLabel>
                                  <div className="border rounded-md p-1 bg-background flex items-center gap-1 flex-wrap">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button type="button" variant="ghost" className="h-8 px-2">
                                            Paragraph <ChevronDown className="h-4 w-4 ml-1" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => applyTag('p', true)}>Paragraph</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => applyTag('h2', true)}>Heading 2</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => applyTag('h3', true)}>Heading 3</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => applyTag('h4', true)}>Heading 4</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Separator orientation="vertical" className="h-6" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyTag('strong')} title="Bold"><Bold className="w-4 h-4"/></Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyTag('em')} title="Italic"><Italic className="w-4 h-4"/></Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyTag('a')} title="Link"><LinkIcon className="w-4 h-4"/></Button>
                                    <Separator orientation="vertical" className="h-6" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyTag('blockquote', true)} title="Blockquote"><Quote className="w-4 h-4"/></Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyList('ul')} title="Unordered List"><List className="w-4 h-4"/></Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => applyList('ol')} title="Ordered List"><ListOrdered className="w-4 h-4"/></Button>
                                  </div>
                                <FormControl>
                                    <Textarea
                                    {...field}
                                    ref={contentRef}
                                    placeholder="<p>Start writing your post content here.</p>"
                                    className="min-h-[400px] font-code"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Frequently Asked Questions (FAQs)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {faqFields.map((field, index) => (
                        <Accordion type="single" collapsible key={field.id} className="border rounded-md px-4 bg-muted/20" defaultValue={`item-${index}`}>
                          <AccordionItem value={`item-${index}`} className="border-0">
                            <AccordionTrigger>
                              <div className="flex items-center gap-2 w-full">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                <span className="truncate">{form.watch(`faqs.${index}.question`) || `FAQ ${index + 1}`}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <FormField
                                  control={form.control}
                                  name={`faqs.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question</FormLabel>
                                      <FormControl>
                                        <Input placeholder="E.g., What is your return policy?" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`faqs.${index}.answer`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Answer</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="E.g., We offer a 30-day return policy..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeFaq(index)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Remove FAQ
                                </Button>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                    <Button type="button" variant="outline" onClick={() => appendFaq({ question: "", answer: "" })}>
                      <Plus className="mr-2 h-4 w-4" /> Add FAQ
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Call to Action (CTA)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="ctaTitle" render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Title</FormLabel>
                                <FormControl><Input placeholder="Ready to get started?" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ctaSubtitle" render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Subtitle</FormLabel>
                                <FormControl><Textarea placeholder="A brief, compelling message." {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ctaText" render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Button Text</FormLabel>
                                <FormControl><Input placeholder="Sign Up Now" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ctaLink" render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Button Link</FormLabel>
                                <FormControl><Input placeholder="/contact" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="seoTitle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>SEO Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="A catchy title for search engines" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>If empty, the post title will be used.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="seoDescription"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>SEO Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="A brief summary for search engines" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="seoKeywords"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>SEO Keywords</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., keyword1, keyword2, keyword3" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>Comma-separated keywords for search engines.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="canonicalUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Canonical URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., https://example.com/original-post" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>The canonical URL for this post to avoid duplicate content issues.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="noIndex"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Disallow search engine indexing
                                </FormLabel>
                                <FormDescription>
                                  Tell search engines not to show this post in search results.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8 sticky top-20">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Details</CardTitle>
                        <div className="flex flex-col items-end gap-2">
                            {post?.urlSlug && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`/blog/${post.urlSlug}`} target="_blank">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Post
                                    </a>
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting} size="sm">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {post ? "Update" : "Create"}
                            </Button>
                        </div>
                  </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="publishedAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Published At</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="isFavorite"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Favorite Post
                                </FormLabel>
                                <FormDescription>
                                  Mark this post as a favorite to highlight it.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Featured Post
                                </FormLabel>
                                <FormDescription>
                                  Feature this post prominently on the blog page.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                    <Input placeholder="Author name" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categories"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Categories</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., technology, design, business" {...field} value={field.value?.join(', ') ?? ''} 
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(cat => cat.trim()).filter(Boolean))} />
                                </FormControl>
                                <FormDescription>Comma-separated list of categories.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="featuredImage.url"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Featured Image URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuredImage.hint"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Image Alt Text</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Describe the image" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {featuredImageUrl && (
                                <div className="mt-2">
                                    <ImageIcon className="h-4 w-4 mb-2" />
                                    <div className="relative aspect-video rounded-md overflow-hidden border">
                                        {/* In a real app, you would use next/image here */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={featuredImageUrl} 
                                            alt={form.watch("featuredImage.hint") || "Featured image preview"} 
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
    </>
  );
}