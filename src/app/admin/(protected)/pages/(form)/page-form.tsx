

"use client";

import { useFieldArray, useForm, Control, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Page, BlockType, ExpandingCardItem, AddressBlock, MemberItem } from "@/lib/types";
import { createPage, updatePage } from "@/app/actions/page-actions";
import { Loader2, Sparkles, AlertCircle, Plus, Trash2, GripVertical, Image as ImageIcon, Code, MessageSquareQuote, Newspaper, Minus, CodeXml, Star, Move, Mail, Building2, User, Users, Tv, Film, ChevronDown, Linkedin, Twitter, Facebook, Instagram, Globe, Map, Phone, Mailbox, ExternalLink, Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Wand2 } from "lucide-react";
import { getContentSuggestions } from "@/ai/flows/content-suggestions";
import { humanizeContent } from "@/ai/flows/humanize-content";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Question is required."),
  answer: z.string().min(1, "Answer is required."),
});

const featuredImageSchema = z.object({
    url: z.string().url("Must be a valid URL.").or(z.literal("")),
    hint: z.string().optional(),
});

const featureItemSchema = z.object({
    id: z.string(),
    icon: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
});

const testimonialItemSchema = z.object({
    id: z.string(),
    quote: z.string().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
});

const galleryImageSchema = z.object({
    id: z.string(),
    url: z.string().optional(),
    alt: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
});

const logoItemSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  alt: z.string().optional(),
});

const bannerSlideSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const expandingCardItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  detailsLink: z.string().optional(),
});

const memberItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  role: z.string().min(1, "Role is required."),
  imageUrl: z.string().url("A valid image URL is required."),
  imageHint: z.string().optional(),
  linkedinUrl: z.string().url("A valid LinkedIn URL is required.").optional().or(z.literal('')),
});

const founderNoteSocialsSchema = z.object({
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
}).optional();

const addressSocialsSchema = z.object({
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
}).optional();

const blockSchema = z.object({
    id: z.string(),
    type: z.enum(['hero', 'features', 'cta', 'testimonial', 'posts', 'gallery', 'html', 'divider', 'expanding-cards', 'contact', 'logo-grid', 'founder-note', 'best-acf', 'banner', 'address', 'community', 'map', 'newsletter', 'banner-v2', 'leadership']),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    html: z.string().optional(),
    selectionType: z.enum(['latest', 'favorite']).optional(),
    features: z.array(featureItemSchema).optional(),
    testimonials: z.array(testimonialItemSchema).optional(),
    images: z.array(galleryImageSchema).optional(),
    logos: z.array(logoItemSchema).optional(),
    preTitle: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    greeting: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().optional(),
    imagePosition: z.enum(['left', 'right']).optional(),
    socials: z.union([founderNoteSocialsSchema, addressSocialsSchema]).optional(),
    view: z.enum(['grid', 'carousel']).optional(),
    scrollDirection: z.enum(['left', 'right']).optional(),
    slides: z.array(bannerSlideSchema).optional(),
    automatic: z.boolean().optional(),
    theme: z.enum(['light', 'dark']).optional(),
    showScroll: z.boolean().optional(),
    showSocial: z.boolean().optional(),
    cards: z.array(expandingCardItemSchema).optional(),
    address: z.string().optional(),
    mapImageUrl: z.string().optional(),
    mapImageHint: z.string().optional(),
    mapEmbedUrl: z.string().optional(),
    layout: z.enum(['side-by-side', 'stacked']).optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    phoneImageUrl: z.string().optional(),
    phoneImageHint: z.string().optional(),
    members: z.array(memberItemSchema).optional(),
});


const pageFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  urlSlug: z.string().min(2, {
    message: "URL Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes, e.g., 'my-page'"),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.boolean().optional(),
  status: z.enum(['draft', 'public']),
  customCss: z.string().optional(),
  customHeadContent: z.string().optional(),
  customSchema: z.string().optional(),
  faqs: z.array(faqSchema).optional(),
  featuredImage: featuredImageSchema.optional(),
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  blocks: z.array(blockSchema).optional(),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

interface PageFormProps {
  page?: Page | null;
}

const BlockIcon = ({ type, className }: { type: BlockType, className?: string }) => {
    const iconMap: Record<BlockType, React.ElementType> = {
        hero: Star,
        features: Star,
        cta: Move,
        testimonial: MessageSquareQuote,
        posts: Newspaper,
        gallery: ImageIcon,
        html: CodeXml,
        divider: Minus,
        contact: Mail,
        'logo-grid': Building2,
        'founder-note': User,
        'best-acf': Tv,
        'banner': Film,
        'expanding-cards': Tv,
        address: Mail,
        community: Users,
        map: Map,
        newsletter: Mailbox,
        'banner-v2': Film,
        leadership: Users,
    };
    const IconComponent = iconMap[type];
    return <IconComponent className={cn("h-5 w-5", className)} />;
};


export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);


  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: page?.title || "",
      urlSlug: page?.urlSlug || "",
      content: page?.content || "",
      seoTitle: page?.seoTitle || "",
      seoDescription: page?.seoDescription || "",
      seoKeywords: page?.seoKeywords || "",
      canonicalUrl: page?.canonicalUrl || "",
      noIndex: page?.noIndex || false,
      status: page?.status || "draft",
      customCss: page?.customCss || "",
      customHeadContent: page?.customHeadContent || "",
      customSchema: page?.customSchema || "",
      faqs: page?.faqs || [],
      featuredImage: page?.featuredImage || { url: "", hint: "" },
      ctaTitle: page?.ctaTitle || "",
      ctaSubtitle: page?.ctaSubtitle || "",
      ctaText: page?.ctaText || "",
      ctaLink: page?.ctaLink || "",
      blocks: page?.blocks || [],
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const { fields: blockFields, append: appendBlock, remove: removeBlock, move: moveBlock } = useFieldArray({
    control: form.control,
    name: "blocks",
  });
  
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
    setDraggedIndex(index);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData("draggedIndex"), 10);
    if (draggedIdx !== dropIndex) {
      moveBlock(draggedIdx, dropIndex);
    }
    setDraggedIndex(null);
  };

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
      if (name === 'title' && !page) { 
        form.setValue('urlSlug', generateSlug(value.title || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, page]);

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
  
  const addBlock = (type: BlockType) => {
    // Create a new block with the correct type
    let newBlock: z.infer<typeof blockSchema> = { id: crypto.randomUUID(), type } as any;
    
    // Ensure blocks array exists
    const currentBlocks = form.getValues('blocks') || [];
    if (type === 'features') {
        newBlock.title = 'Key Features';
        newBlock.subtitle = 'Discover what makes us stand out.';
        newBlock.features = [{ id: crypto.randomUUID(), icon: 'Rocket', title: 'Fast Performance', description: 'Optimized for speed.' }];
    }
    if (type === 'testimonial') {
        newBlock.title = 'What Our Clients Say';
        newBlock.testimonials = [{ id: crypto.randomUUID(), name: 'Jane Doe', company: 'Tech Corp', quote: 'An amazing experience!' }];
        newBlock.view = 'grid';
    }
    if (type === 'posts') {
        newBlock.title = 'From Our Blog';
        newBlock.selectionType = 'latest';
    }
    if (type === 'gallery') {
        newBlock.title = 'Our Work';
        newBlock.images = [{ id: crypto.randomUUID(), url: 'https://picsum.photos/seed/1/400/400', alt: 'Placeholder', title: 'Untitled', description: '' }];
    }
    if (type === 'logo-grid') {
      newBlock.title = 'Our Partners';
      newBlock.subtitle = 'We work with the best in the industry.';
      newBlock.logos = [{ id: crypto.randomUUID(), url: 'https://picsum.photos/seed/logo1/200/100', alt: 'Partner' }];
    }
    if (type === 'html') {
        newBlock.html = '<div>\n  <h2 class="text-2xl font-bold">Custom HTML Block</h2>\n  <p>Your custom content here.</p>\n</div>';
    }
    if (type === 'hero') {
        newBlock.title = 'Welcome to our Site!';
        newBlock.subtitle = 'This is a hero section.';
        newBlock.ctaText = 'Learn More';
        newBlock.ctaLink = '/about';
    }
    if (type === 'cta') {
        newBlock.title = 'Ready to start?';
        newBlock.ctaText = 'Contact Us';
        newBlock.ctaLink = '/contact';
    }
    if (type === 'contact') {
        newBlock.title = 'Get In Touch';
        newBlock.subtitle = "We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.";
        newBlock.ctaText = 'Contact Us';
        newBlock.ctaLink = '/contact';
    }
    if (type === 'founder-note') {
        newBlock.preTitle = 'A Note From';
        newBlock.greeting = 'Hey,';
        newBlock.name = 'Rajesh Laddha';
        newBlock.role = 'Founder & CEO';
        newBlock.content = "I'm Raj. I started cmsMinds because I've always believed in the power of the open web...";
        newBlock.imageUrl = 'https://picsum.photos/seed/founder/400/400';
        newBlock.imagePosition = 'left';
        newBlock.socials = { linkedin: '#', twitter: '#', facebook: '#', instagram: '#' };
    }
    if (type === 'best-acf') {
        newBlock.title = 'Advanced Content Block';
        newBlock.subtitle = 'Highly customizable';
        newBlock.content = '<p>This is a paragraph.</p>';
        newBlock.imageUrl = 'https://picsum.photos/seed/acf/600/400';
        newBlock.imagePosition = 'right';
    }
    if (type === 'banner') {
      newBlock.automatic = true;
      newBlock.slides = [{ id: crypto.randomUUID(), title: 'Banner Title', subtitle: 'Banner subtitle', imageUrl: 'https://picsum.photos/seed/banner1/1920/1080', ctaText: 'Learn More', ctaLink: '#' }];
      newBlock.theme = 'dark';
      newBlock.showScroll = true;
      newBlock.showSocial = true;
    }
    if (type === 'expanding-cards') {
      newBlock.title = 'Expanding Cards';
      newBlock.subtitle = 'Interactive cards that expand on hover.';
      newBlock.cards = [{ id: crypto.randomUUID(), title: 'Card 1', description: 'Description for card 1.', imageUrl: 'https://picsum.photos/seed/card1/400/600', detailsLink: '#' }];
    }
    if (type === 'address') {
        newBlock.address = '8404 Six Fork Road, Suite 204B\nRaleigh, NC 27615';
        newBlock.mapImageUrl = 'https://raw.githubusercontent.com/bjcarlson42/portfoliogenerator/main/src/lib/assets/nc-map.png';
        newBlock.socials = { twitter: '#', facebook: '#', linkedin: '#', website: '#' };
    }
    if (type === 'map') {
        newBlock.title = 'Our Location';
        newBlock.address = '1600 Amphitheatre Parkway, Mountain View, CA 94043';
        newBlock.mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.610233983995!2d-73.9878436845939!3d40.7484409793282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9a31b673d%3A0x1a9557434545b63!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1628000000000!5m2!1sen!2sus';
    }
    if (type === 'newsletter') {
        newBlock.title = 'Subscribe to our Newsletter';
        newBlock.subtitle = 'Get the latest news, articles, and resources, sent to your inbox weekly.';
        newBlock.ctaText = 'Subscribe';
    }
     if (type === 'banner-v2') {
        newBlock.title = "What's the best way to enhance your photos?";
        newBlock.ctaText = 'Get Started';
        newBlock.ctaLink = '/';
        newBlock.phoneImageUrl = 'https://raw.githubusercontent.com/bjcarlson42/portfoliogenerator/main/src/lib/assets/phone-mockup.png';
    }
    if (type === 'leadership') {
        newBlock.title = 'Our Leadership';
        newBlock.subtitle = 'Meet the team behind our success.';
        newBlock.members = [{ id: crypto.randomUUID(), name: 'Jane Doe', role: 'CEO', imageUrl: 'https://picsum.photos/seed/leader1/400/400', linkedinUrl: '#' }];
    }
    appendBlock(newBlock);
  }

  async function onSubmit(data: PageFormValues) {
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
              if (key === 'faqs' || key === 'featuredImage' || key === 'blocks') {
                formData.append(key, JSON.stringify(value));
              } else if (typeof value === 'boolean') {
                formData.append(key, value ? 'on' : 'off');
              } else {
                formData.append(key, value as string);
              }
            }
        });

        const result = page
          ? await updatePage(idToken, page.id, formData)
          : await createPage(idToken, formData);

        if (result.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: page ? "Page updated successfully." : "Page created successfully.",
          });
          router.push("/admin/pages");
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
                                    <Input placeholder="My Awesome Page" {...field} />
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
                                    placeholder="<p>Start writing your page content here.</p>"
                                    className="min-h-[400px] font-code"
                                    />

                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">Content Blocks</h2>
                  <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
                    {blockFields.map((field, index) => (
                      <div key={field.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDrop={(e) => onDrop(e, index)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={cn(
                            "rounded-lg transition-all border",
                            draggedIndex === index ? "opacity-50 ring-2 ring-primary" : "bg-card"
                        )}>
                        <Collapsible defaultOpen={true}>
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-t-lg border-b">
                              <div className="flex items-center gap-3">
                                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                  <BlockIcon type={field.type as BlockType} className="text-muted-foreground" />
                                  <span className="font-semibold capitalize">{field.type.replace('-', ' ')} Section</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                          <span className="sr-only">Toggle</span>
                                      </Button>
                                  </CollapsibleTrigger>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBlock(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-6 space-y-6">
                                  {field.type === 'banner' && <BannerSubForm blockIndex={index} control={form.control as any} />}
                                  {field.type === 'map' && <MapSubForm blockIndex={index} control={form.control as any} />}
                                  {field.type === 'banner-v2' && <BannerV2SubForm blockIndex={index} control={form.control as any} />}
                                  {field.type === 'newsletter' && <NewsletterSubForm blockIndex={index} control={form.control as any} />}
                                  {field.type === 'leadership' && <LeadershipSubForm blockIndex={index} control={form.control as any} />}
                                  {(field.type !== 'divider' && field.type !== 'contact' && field.type !== 'founder-note' && field.type !== 'banner' && field.type !== 'expanding-cards' && field.type !== 'address' && field.type !== 'map' && field.type !== 'newsletter' && field.type !== 'banner-v2' && field.type !== 'leadership') && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormField control={form.control} name={`blocks.${index}.title`} render={({ field: formField }) => (
                                              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Section Title" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                          )} />
                                          <FormField control={form.control} name={`blocks.${index}.subtitle`} render={({ field: formField }) => (
                                              <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input placeholder="Section Subtitle" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                          )} />
                                      </div>
                                  )}
                                  {(field.type === 'hero' || field.type === 'cta' || field.type === 'contact') && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormField control={form.control} name={`blocks.${index}.ctaText`} render={({ field: formField }) => (
                                              <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input placeholder="E.g., Learn More" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                          )} />
                                          <FormField control={form.control} name={`blocks.${index}.ctaLink`} render={({ field: formField }) => (
                                              <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input placeholder="E.g., /about" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                          )} />
                                      </div>
                                  )}
                             {field.type === 'contact' && (
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField control={form.control} name={`blocks.${index}.title`} render={({ field: formField }) => (
                                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Section Title" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`blocks.${index}.subtitle`} render={({ field: formField }) => (
                                        <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea placeholder="Section Subtitle" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            )}
                            {field.type === 'posts' && (
                                <FormField control={form.control} name={`blocks.${index}.selectionType`} render={({ field: formField }) => (
                                    <FormItem><FormLabel>Post Selection</FormLabel>
                                        <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select which posts to display" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="latest">Latest Posts</SelectItem><SelectItem value="favorite">Favorite Posts</SelectItem></SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                            {field.type === 'html' && (
                                <FormField control={form.control} name={`blocks.${index}.html`} render={({ field: formField }) => (
                                <FormItem><FormLabel>Custom HTML</FormLabel>
                                    <FormControl><Textarea placeholder="<div>Your HTML here</div>" className="min-h-[200px] font-mono" {...formField} value={formField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                            {field.type === 'features' && <FeaturesSubForm blockIndex={index} control={form.control} />}
                            {field.type === 'testimonial' && <TestimonialsSubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'gallery' && <GallerySubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'logo-grid' && <LogoGridSubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'founder-note' && <FounderNoteSubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'best-acf' && <BestAcfSubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'expanding-cards' && <ExpandingCardsSubForm blockIndex={index} control={form.control as any} />}
                            {field.type === 'address' && <AddressSubForm blockIndex={index} control={form.control as any} />}
                       </div>
                   </CollapsibleContent>
                   </Collapsible>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg"><Plus className="mr-2 h-4 w-4" /> Add Block</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => addBlock('banner')}><Film className="mr-2 h-4 w-4" />Banner</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('banner-v2')}><Film className="mr-2 h-4 w-4" />Banner V2</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('hero')}><Star className="mr-2 h-4 w-4" />Hero</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('features')}><Star className="mr-2 h-4 w-4" />Features</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('leadership')}><Users className="mr-2 h-4 w-4" />Leadership</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('expanding-cards')}><Tv className="mr-2 h-4 w-4" />Expanding Cards</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('founder-note')}><User className="mr-2 h-4 w-4" />Founder Note</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('address')}><Mail className="mr-2 h-4 w-4" />Address</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('map')}><Map className="mr-2 h-4 w-4" />Map</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('newsletter')}><Mailbox className="mr-2 h-4 w-4" />Newsletter</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('cta')}><Move className="mr-2 h-4 w-4" />Call to Action</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('contact')}><Mail className="mr-2 h-4 w-4" />Contact</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('testimonial')}><MessageSquareQuote className="mr-2 h-4 w-4" />Testimonial</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('posts')}><Newspaper className="mr-2 h-4 w-4" />Recent Posts</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('gallery')}><ImageIcon className="mr-2 h-4 w-4" />Gallery</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('logo-grid')}><Building2 className="mr-2 h-4 w-4" />Logo Grid</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('best-acf')}><Tv className="mr-2 h-4 w-4" />Best ACF</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('html')}><CodeXml className="mr-2 h-4 w-4" />Custom HTML</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addBlock('divider')}><Minus className="mr-2 h-4 w-4" />Divider</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>


                <Card>
                  <CardHeader><CardTitle>Frequently Asked Questions (FAQs)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {faqFields.map((field, index) => (
                        <Accordion type="single" collapsible key={field.id} className="border rounded-md px-4 bg-muted/20" defaultValue={'item-${index}'}>
                          <AccordionItem value={'item-${index}'} className="border-0">
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
                                <FormDescription>If empty, the page title will be used.</FormDescription>
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
                                    <Input placeholder="e.g., https://example.com/original-page" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>The canonical URL for this page to avoid duplicate content issues.</FormDescription>
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
                                  Tell search engines not to show this page in search results.
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
                            {page?.urlSlug && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`/${page.urlSlug === 'home' ? '' : page.urlSlug}`} target="_blank">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Page
                                    </a>
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting} size="sm">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {page ? "Update" : "Create"}
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
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Draft pages are not visible to the public.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="urlSlug"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL Slug</FormLabel>
                                <FormControl>
                                    <Input placeholder="my-awesome-page" {...field} />
                                </FormControl>
                                <FormDescription>This is the page's path, e.g., /my-awesome-page</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Featured Image</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <FormItem>
                            <FormLabel>Image Library</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                                    if (selectedImage) {
                                        form.setValue('featuredImage.url', selectedImage.imageUrl);
                                        form.setValue('featuredImage.hint', selectedImage.imageHint);
                                    }
                                }}
                                defaultValue={featuredImageUrl}
                            >
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an image from library" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {PlaceHolderImages.map(img => (
                                    <SelectItem key={img.id} value={img.imageUrl}>
                                        <div className="flex items-center gap-3">
                                            <Image src={img.imageUrl} alt={img.description} width={40} height={40} className="rounded-sm object-cover" unoptimized/>
                                            <span>{img.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="featuredImage.url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''}/>
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
                                    <FormLabel>Image Hint</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 'abstract art'" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormDescription>Short description for alt text and AI.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {featuredImageUrl && (
                             <div className="aspect-video relative my-4 rounded-lg overflow-hidden border">
                                <Image
                                    src={featuredImageUrl}
                                    alt="Featured image preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                        {!featuredImageUrl && (
                            <div className="aspect-video my-4 rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mt-2">Image Preview</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Advanced</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="customCss"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Custom CSS</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder=".my-custom-class { color: red; }"
                                        className="min-h-[200px] font-code"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormDescription>This CSS will only be applied to this page.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customHeadContent"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Custom Head Content</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="<meta...>, <link...>, <script...>"
                                        className="min-h-[200px] font-code"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormDescription>Raw HTML to be injected into the document's &lt;head&gt;.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customSchema"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Custom Schema</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='{ "@context": "https://schema.org", "@type": "Article", ... }'
                                        className="min-h-[200px] font-code"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormDescription>Enter a valid JSON-LD schema. This will be injected into a script tag.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
    <Dialog open={aiSuggestions !== ""} onOpenChange={(open) => !open && setAiSuggestions("")}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Content Suggestions</DialogTitle>
          <DialogDescription>
            Here are some AI-powered suggestions based on your existing content. Copy and paste what you like.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 bg-muted p-4 rounded-md max-h-[50vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-body text-sm">{aiSuggestions}</pre>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

function FeaturesSubForm({ blockIndex, control }: { blockIndex: number, control: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `blocks.${blockIndex}.features`
    });

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-lg">Features Items</h4>
            <Separator />
            {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
                    <FormField control={control} name={`blocks.${blockIndex}.features.${index}.icon`} render={({ field }) => (
                        <FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input placeholder="Lucide icon name, e.g., 'Rocket'" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={control} name={`blocks.${blockIndex}.features.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Feature Title" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`blocks.${blockIndex}.features.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Feature Description" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), icon: '', title: '', description: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Feature
            </Button>
        </div>
    )
}

function TestimonialsSubForm({ blockIndex, control }: { blockIndex: number, control: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `blocks.${blockIndex}.testimonials`
    });

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-lg">Testimonial Items</h4>
            <Separator />
            {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
                     <FormField control={control} name={`blocks.${blockIndex}.testimonials.${index}.quote`} render={({ field }) => (
                        <FormItem><FormLabel>Quote</FormLabel><FormControl><Textarea placeholder="Testimonial Quote" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={control} name={`blocks.${blockIndex}.testimonials.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Customer Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`blocks.${blockIndex}.testimonials.${index}.company`} render={({ field }) => (
                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Customer's Company" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), quote: '', name: '', company: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
        </div>
    )
}

function GallerySubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `blocks.${blockIndex}.images`
    });
    const { setValue, watch } = useFormContext();

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-lg">Gallery Images</h4>
            <Separator />
            {fields.map((field, index) => {
                const imageUrl = watch(`blocks.${blockIndex}.images.${index}.url`);
                return (
                    <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div>
                                <FormItem>
                                    <FormLabel>Image Library</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                                            if (selectedImage) {
                                                setValue(`blocks.${blockIndex}.images.${index}.url`, selectedImage.imageUrl);
                                                setValue(`blocks.${blockIndex}.images.${index}.alt`, selectedImage.description);
                                            }
                                        }}
                                    >
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an image" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {PlaceHolderImages.map(img => (
                                            <SelectItem key={img.id} value={img.imageUrl}>
                                                {img.description}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>

                                <FormField control={control} name={`blocks.${blockIndex}.images.${index}.url`} render={({ field: formField }) => (
                                    <FormItem className="mt-2"><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...formField} value={formField.value || ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div>
                                {imageUrl && (
                                    <div className="aspect-video relative rounded-md overflow-hidden border">
                                        <Image src={imageUrl} alt="Image preview" fill className="object-cover" unoptimized/>
                                    </div>
                                )}
                            </div>
                         </div>
                        <FormField control={control} name={`blocks.${blockIndex}.images.${index}.alt`} render={({ field: formField }) => (
                            <FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Description of the image" {...formField} value={formField.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={control} name={`blocks.${blockIndex}.images.${index}.title`} render={({ field: formField }) => (
                            <FormItem><FormLabel>Image Title</FormLabel><FormControl><Input placeholder="Title for the image" {...formField} value={formField.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`blocks.${blockIndex}.images.${index}.description`} render={({ field: formField }) => (
                            <FormItem><FormLabel>Image Description</FormLabel><FormControl><Input placeholder="A short description" {...formField} value={formField.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            })}
            <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), url: '', alt: '', title: '', description: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Image
            </Button>
        </div>
    )
}

function LogoGridSubForm({ blockIndex, control }: { blockIndex: number, control: Control<PageFormValues> }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `blocks.${blockIndex}.logos`
    });
    const { watch } = useFormContext();
    const view = watch(`blocks.${blockIndex}.view`);

    return (
        <div className="space-y-4">
            <FormField
              control={control}
              name={`blocks.${blockIndex}.view` as 'blocks.0.view'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>View</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'grid'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a view" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {view === 'carousel' && (
              <FormField
                control={control}
                name={`blocks.${blockIndex}.scrollDirection` as 'blocks.0.scrollDirection'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scroll Direction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'left'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scroll direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">Left to Right</SelectItem>
                        <SelectItem value="right">Right to Left</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <h4 className="font-medium text-lg">Logos</h4>
            <Separator />
            {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={control} name={`blocks.${blockIndex}.logos.${index}.url`} render={({ field }) => (
                            <FormItem><FormLabel>Logo URL</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`blocks.${blockIndex}.logos.${index}.alt`} render={({ field }) => (
                            <FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Company Name" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), url: '', alt: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Logo
            </Button>
        </div>
    )
}

function FounderNoteSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
  const { watch, setValue } = useFormContext<PageFormValues>();
  const imageUrl = watch(`blocks.${blockIndex}.imageUrl`);
  const greeting = watch(`blocks.${blockIndex}.greeting`);

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={`blocks.${blockIndex}.preTitle` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pre-Title</FormLabel>
            <FormControl>
              <Input placeholder="A Note From" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`blocks.${blockIndex}.greeting` as any}
        render={({ field }) => (
            <FormItem>
                <FormLabel>Greeting</FormLabel>
                <FormControl>
                    <Input placeholder="Hey," {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
        />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`blocks.${blockIndex}.name` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`blocks.${blockIndex}.role` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Founder & CEO" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
       <FormField
        control={control}
        name={`blocks.${blockIndex}.content` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <Textarea placeholder="Your message here..." className="min-h-[200px]" {...field} value={field.value ?? ''}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <FormField
          control={control}
          name={`blocks.${blockIndex}.imageUrl` as any}
          render={({ field }) => (
              <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
              </FormItem>
          )}
          />
          {imageUrl && (
              <div className="w-32 h-32 relative my-4 rounded-full overflow-hidden border-4 border-background ring-2 ring-border">
              <Image
                  src={imageUrl}
                  alt="Founder image preview"
                  fill
                  className="object-cover"
                  unoptimized
              />
              </div>
          )}
        </div>
        <FormField
          control={control}
          name={`blocks.${blockIndex}.imagePosition` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'left'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <h4 className="font-medium text-lg mb-4">Social Media Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={control} name={`blocks.${blockIndex}.socials.linkedin` as any} render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Linkedin /> LinkedIn</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.socials.twitter` as any} render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Twitter /> Twitter</FormLabel>
                    <FormControl><Input placeholder="https://twitter.com/..." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.socials.facebook` as any} render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Facebook /> Facebook</FormLabel>
                    <FormControl><Input placeholder="https://facebook.com/..." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.socials.instagram` as any} render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Instagram /> Instagram</FormLabel>
                    <FormControl><Input placeholder="https://instagram.com/..." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
        </div>
      </div>
    </div>
  );
}

function BestAcfSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
  const { watch, setValue } = useFormContext();
  const imageUrl = watch(`blocks.${blockIndex}.imageUrl`);

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={`blocks.${blockIndex}.content` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content (HTML)</FormLabel>
            <FormControl>
              <Textarea placeholder="<p>Your content here...</p>" {...field} className="min-h-[200px] font-code" value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <FormField
            control={control}
            name={`blocks.${blockIndex}.imageUrl` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {imageUrl && (
            <div className="aspect-video relative my-4 rounded-lg overflow-hidden border">
              <Image
                src={imageUrl}
                alt="Image preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
        <FormField
          control={control}
          name={`blocks.${blockIndex}.imagePosition` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'right'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function BannerSubForm({ blockIndex, control }: { blockIndex: number, control: Control<PageFormValues> }) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `blocks.${blockIndex}.slides`
  });
  const { watch, setValue } = useFormContext<PageFormValues>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
    setDraggedIndex(index);
  };

  const onDrop = (e: React.DragEvent, index: number) => {
      if (draggedIndex === null) return;
    e.preventDefault();
      move(draggedIndex, index);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
            control={control}
            name={`blocks.${blockIndex}.preTitle`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Pre-title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. NEW GEN AI AUTOMATION" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name={`blocks.${blockIndex}.theme`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={control}
                name={`blocks.${blockIndex}.automatic`}
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <FormLabel>Automatic Slider</FormLabel>
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
            <FormField
                control={control}
                name={`blocks.${blockIndex}.showScroll`}
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <FormLabel>Show Scroll</FormLabel>
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
            <FormField
                control={control}
                name={`blocks.${blockIndex}.showSocial`}
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <FormLabel>Show Social</FormLabel>
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
        </CardContent>
        </Card>

        <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-lg">Banner Slides</h4>
            <div 
              className="space-y-4"
              onDragOver={(e) => e.preventDefault()}
            >
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDrop={(e) => onDrop(e, index)}
                className={cn("transition-all", draggedIndex === index && "opacity-50 ring-2 ring-primary rounded-lg")}
              >
                <Accordion type="single" collapsible className="border rounded-md bg-muted/20" defaultValue="item-0">
                    <AccordionItem value={`item-${index}`} className="border-0">
                        <AccordionTrigger className="px-4 py-2">
                            <div className="flex items-center gap-2 w-full">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                <span className="font-medium truncate">{watch(`blocks.${blockIndex}.slides.${index}.title`) || `Slide ${index + 1}`}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 space-y-4 border-t">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={control}
                                name={`blocks.${blockIndex}.slides.${index}.title`}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Slide Title" {...formField} value={formField.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`blocks.${blockIndex}.slides.${index}.subtitle`}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Slide Subtitle" {...formField} value={formField.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                           </div>

                            <FormItem>
                                <FormLabel>Background Image URL</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                                        if (selectedImage) {
                                            setValue(`blocks.${blockIndex}.slides.${index}.imageUrl`, selectedImage.imageUrl);
                                            setValue(`blocks.${blockIndex}.slides.${index}.imageHint`, selectedImage.imageHint);
                                        }
                                    }}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select from image library" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {PlaceHolderImages.map(img => (
                                        <SelectItem key={img.id} value={img.imageUrl}>
                                            <div className="flex items-center gap-3">
                                                <Image src={img.imageUrl} alt={img.description} width={40} height={40} className="rounded-sm object-cover" unoptimized />
                                                <span>{img.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>

                            <FormField
                                control={control}
                                name={`blocks.${blockIndex}.slides.${index}.imageUrl`}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Or paste image URL" {...formField} value={formField.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name={`blocks.${blockIndex}.slides.${index}.ctaText`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Button Text</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Learn More" {...formField} value={formField.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`blocks.${blockIndex}.slides.${index}.ctaLink`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Button Link</FormLabel>
                                            <FormControl>
                                                <Input placeholder="/about" {...formField} value={formField.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Remove Slide
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </div>
            ))}
        </div>
        <Button
            type="button"
            variant="outline"
            onClick={() => append({ id: crypto.randomUUID(), title: '', subtitle: '', imageUrl: '' })}
            className="mt-4"
        >
            <Plus className="mr-2 h-4 w-4" /> Add Slide
        </Button>
        </div>
    </div>
  );
}

function ExpandingCardsSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `blocks.${blockIndex}.cards`,
  });

  const { setValue } = useFormContext();

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Expanding Cards</h4>
      <Separator />
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
          <FormField
            control={control}
            name={`blocks.${blockIndex}.cards.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Card Title" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`blocks.${blockIndex}.cards.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Card Description" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormItem>
            <FormLabel>Image</FormLabel>
            <Select
                onValueChange={(value) => {
                    const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                    if (selectedImage) {
                        setValue(`blocks.${blockIndex}.cards.${index}.imageUrl`, selectedImage.imageUrl);
                        setValue(`blocks.${blockIndex}.cards.${index}.imageHint`, selectedImage.imageHint);
                    }
                }}
            >
                <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select from image library" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                {PlaceHolderImages.map(img => (
                    <SelectItem key={img.id} value={img.imageUrl}>
                        {img.description}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </FormItem>
            <FormField
                control={control}
                name={`blocks.${blockIndex}.cards.${index}.imageUrl`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="Or paste image URL" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          <FormField
            control={control}
            name={`blocks.${blockIndex}.cards.${index}.detailsLink`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details Link</FormLabel>
                <FormControl>
                  <Input placeholder="/details-page" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ id: crypto.randomUUID(), title: '', description: '', imageUrl: '', detailsLink: '#' })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Card
      </Button>
    </div>
  );
}

function AddressSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
  const { setValue, watch } = useFormContext<PageFormValues>();
  const mapImageUrl = watch(`blocks.${blockIndex}.mapImageUrl`);
  const socials = watch(`blocks.${blockIndex}.socials`) || {};
  
  type SocialMedia = 'twitter' | 'facebook' | 'linkedin' | 'website' | 'instagram';
  const allSocials: SocialMedia[] = ['twitter', 'facebook', 'linkedin', 'website', 'instagram'];
  
  // Type for the socials object
  type FounderNoteSocialsType = { linkedin?: string; twitter?: string; facebook?: string; instagram?: string };
  type AddressSocialsType = { twitter?: string; facebook?: string; linkedin?: string; website?: string };
  type SocialsUnionType = FounderNoteSocialsType | AddressSocialsType;
  
  // Type guard function to safely access socials properties
  const getSocialValue = (socials: SocialsUnionType, key: SocialMedia): string | undefined => {
    // Check which type of socials object we have and access the property safely
    if ('instagram' in socials && key === 'instagram') {
      return (socials as FounderNoteSocialsType)[key];
    }
    if ('website' in socials && key === 'website') {
      return (socials as AddressSocialsType)[key];
    }
    // For common properties, we can access them directly
    if (key === 'twitter' || key === 'facebook' || key === 'linkedin') {
      return (socials as FounderNoteSocialsType & AddressSocialsType)[key];
    }
    return undefined;
  };
  
  const [visibleSocials, setVisibleSocials] = useState<SocialMedia[]>(
    Object.keys(socials).filter(key => {
      // Type guard to check if key is a valid SocialMedia
      if (allSocials.includes(key as SocialMedia)) {
        return getSocialValue(socials, key as SocialMedia);
      }
      return false;
    }) as SocialMedia[]
  );

  const addSocial = (social: SocialMedia) => {
    if (!visibleSocials.includes(social)) {
      setVisibleSocials([...visibleSocials, social]);
    }
  };
  
  return (
    <div className="space-y-6">
       <FormField
        control={control}
        name={`blocks.${blockIndex}.address`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="123 Main St..." {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
             <FormItem>
                <FormLabel>Map Image</FormLabel>
                <Select
                    onValueChange={(value) => {
                        const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                        if (selectedImage) {
                            setValue(`blocks.${blockIndex}.mapImageUrl`, selectedImage.imageUrl);
                            setValue(`blocks.${blockIndex}.mapImageHint`, selectedImage.imageHint);
                        }
                    }}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select from image library" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {PlaceHolderImages.map(img => (
                        <SelectItem key={img.id} value={img.imageUrl}>
                            {img.description}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </FormItem>
            <FormField
                control={control}
                name={`blocks.${blockIndex}.mapImageUrl`}
                render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel>Map Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="Or paste image URL" {...formField} value={formField.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        {mapImageUrl && (
            <div className="aspect-video relative rounded-lg overflow-hidden border">
                <Image src={mapImageUrl} alt="Map preview" fill className="object-cover" unoptimized/>
            </div>
        )}
      </div>

       <div>
        <h4 className="font-medium text-lg mb-4">Social Media Links</h4>
        <div className="space-y-4">
            {visibleSocials.map((social) => (
                 <FormField
                    key={social}
                    control={control}
                    name={`blocks.${blockIndex}.socials.${social}` as any}
                    render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2 capitalize">
                            {social === 'twitter' && <Twitter />}
                            {social === 'facebook' && <Facebook />}
                            {social === 'linkedin' && <Linkedin />}
                            {social === 'website' && <Globe />}
                            {social}
                        </FormLabel>
                        <FormControl><Input placeholder={`https://${social}.com/...`} {...formField} value={formField.value ?? ''} /></FormControl>
                    </FormItem>
                )} />
            ))}
        </div>
         <div className="flex gap-2 mt-4">
            {allSocials.filter(s => !visibleSocials.includes(s)).map(social => (
                <Button key={social} type="button" variant="outline" size="sm" onClick={() => addSocial(social)}>
                   <Plus className="h-4 w-4 mr-2" /> Add {social.charAt(0).toUpperCase() + social.slice(1)}
                </Button>
            ))}
         </div>
      </div>
    </div>
  );
}

function MapSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
  return (
    <div className="space-y-6">
      <FormField control={control} name={`blocks.${blockIndex}.title`} render={({ field }) => (
        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Our Location" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField
        control={control}
        name={`blocks.${blockIndex}.layout` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Layout</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || 'side-by-side'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a layout" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="side-by-side">Side by Side</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField control={control} name={`blocks.${blockIndex}.address`} render={({ field }) => (
        <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`blocks.${blockIndex}.mapEmbedUrl`} render={({ field }) => (
        <FormItem>
          <FormLabel>Map Embed URL</FormLabel>
          <FormControl><Input placeholder="Google Maps embed URL" {...field} value={field.value ?? ''} /></FormControl>
          <FormDescription>{"Get this from Google Maps: Share > Embed a map > Copy HTML (use only the src URL)."}</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={control} name={`blocks.${blockIndex}.email`} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.phone`} render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={control} name={`blocks.${blockIndex}.ctaText`} render={({ field }) => (
                <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input placeholder="Get Directions" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.ctaLink`} render={({ field }) => (
                <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
    </div>
  );
}


function BannerV2SubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
    const { setValue, watch } = useFormContext<PageFormValues>();
    const phoneImageUrl = watch(`blocks.${blockIndex}.phoneImageUrl` as any);
  
    return (
      <div className="space-y-6">
        <FormField
          control={control}
          name={`blocks.${blockIndex}.title` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Textarea placeholder="Section Title" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={control}
            name={`blocks.${blockIndex}.ctaText` as any}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Button Text</FormLabel>
                <FormControl>
                    <Input placeholder="Get Started" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={control}
            name={`blocks.${blockIndex}.ctaLink` as any}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Button Link</FormLabel>
                <FormControl>
                    <Input placeholder="/signup" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div>
            <FormLabel>Phone Image</FormLabel>
             <FormItem>
                <FormLabel>Image Library</FormLabel>
                <Select
                    onValueChange={(value) => {
                        const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                        if (selectedImage) {
                            setValue(`blocks.${blockIndex}.phoneImageUrl` as any, selectedImage.imageUrl);
                            setValue(`blocks.${blockIndex}.phoneImageHint` as any, selectedImage.imageHint);
                        }
                    }}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select from image library" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {PlaceHolderImages.map(img => (
                        <SelectItem key={img.id} value={img.imageUrl}>
                            {img.description}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </FormItem>
            <FormField
                control={control}
                name={`blocks.${blockIndex}.phoneImageUrl` as any}
                render={({ field }) => (
                    <FormItem className="mt-2">
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="Or paste image URL" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             {phoneImageUrl && (
                <div className="mt-4 p-4 border rounded-md bg-muted/30 flex justify-center items-center h-64">
                    <div className="relative w-32 h-56">
                        <Image src={phoneImageUrl} alt="Phone mockup preview" fill className="object-contain" unoptimized/>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

function NewsletterSubForm({ blockIndex, control }: { blockIndex: number, control: any }) {
    return (
        <div className="space-y-4">
            <FormField control={control} name={`blocks.${blockIndex}.title`} render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Section Title" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`blocks.${blockIndex}.subtitle`} render={({ field }) => (
                <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea placeholder="Section Subtitle" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={control} name={`blocks.${blockIndex}.ctaText`} render={({ field }) => (
                <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input placeholder="e.g., Subscribe Now" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
    )
}

function LeadershipSubForm({ blockIndex, control }: { blockIndex: number; control: Control<PageFormValues> }) {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `blocks.${blockIndex}.members`,
    });
    const { setValue, watch } = useFormContext();
  
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Team Members</h4>
        <Separator />
        {fields.map((field, index) => {
          const imageUrl = watch(`blocks.${blockIndex}.members.${index}.imageUrl`);
          return (
            <div key={field.id} className="p-4 border rounded-md bg-muted/30 space-y-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`blocks.${blockIndex}.members.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Jane Doe" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`blocks.${blockIndex}.members.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl><Input placeholder="CEO" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                                if (selectedImage) {
                                    setValue(`blocks.${blockIndex}.members.${index}.imageUrl`, selectedImage.imageUrl);
                                    setValue(`blocks.${blockIndex}.members.${index}.imageHint`, selectedImage.imageHint);
                                }
                            }}
                        >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select from image library" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {PlaceHolderImages.map(img => (
                                <SelectItem key={img.id} value={img.imageUrl}>
                                    {img.description}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                    <FormField
                        control={control}
                        name={`blocks.${blockIndex}.members.${index}.imageUrl`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl><Input placeholder="Or paste image URL" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <div>
                    {imageUrl && (
                        <div className="w-24 h-24 relative my-4 rounded-full overflow-hidden border-4 border-background ring-2 ring-border">
                            <Image src={imageUrl} alt="Member image preview" fill className="object-cover" unoptimized/>
                        </div>
                    )}
                  </div>
              </div>
              <FormField
                control={control}
                name={`blocks.${blockIndex}.members.${index}.linkedinUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ id: crypto.randomUUID(), name: '', role: '', imageUrl: '', linkedinUrl: '#' })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>
    );
  }
    
    






    


    