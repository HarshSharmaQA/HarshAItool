'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { createProduct, updateProduct } from '@/app/actions/product-actions';
import {
  Loader2,
  AlertCircle,
  ImageIcon,
  PlusCircle,
  ExternalLink,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  ChevronDown
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/components/providers/app-providers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer'),
  status: z.enum(['draft', 'published']),
  slug: z
    .string()
    .min(1, 'URL Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  image: z.object({
    url: z.string().url('A valid image URL is required.'),
    hint: z.string().optional(),
  }),
  isFeatured: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  noIndex: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, settings } = useUser();
  const currency = settings?.currency || '₹';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      sku: product?.sku || '',
      stock: product?.stock || 0,
      status: product?.status || 'draft',
      slug: product?.slug || '',
      image: product?.image || { url: '', hint: '' },
      isFeatured: product?.isFeatured || false,
      category: product?.category || '',
      tags: product?.tags?.join(', ') || '',
      seoTitle: product?.seoTitle || '',
      seoDescription: product?.seoDescription || '',
      seoKeywords: product?.seoKeywords || '',
      canonicalUrl: product?.canonicalUrl || '',
      noIndex: product?.noIndex || false,
    },
  });

  const imageUrl = form.watch('image.url');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && !product) {
        // Only auto-slug for new products
        form.setValue('slug', generateSlug(value.name || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, product]);
  
  const applyTag = (tag: string, isBlock = false) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = form.getValues('description');
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
  
    form.setValue('description', newText, { shouldDirty: true, shouldValidate: true });
    
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
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.getValues('description');
    const selectedText = text.substring(start, end);
    const listItems = selectedText.split('\n').map(line => `  <li>${line}</li>`).join('\n');
    const list = `<${tag}>\n${listItems}\n</${tag}>`;
    const newText = text.substring(0, start) + list + text.substring(end);
    form.setValue('description', newText, { shouldDirty: true, shouldValidate: true });
  };


  async function onSubmit(data: ProductFormValues) {
    if (!user) {
      setFormError('You must be logged in to perform this action.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      // A more robust way to handle FormData conversion
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'on' : 'off');
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const result = product
        ? await updateProduct(idToken, product.id, formData)
        : await createProduct(idToken, formData);

      if (result?.error) {
        setFormError(result.error);
      } else {
        toast({
          title: 'Success',
          description: product
            ? 'Product updated successfully.'
            : 'Product created successfully.',
        });
        router.push('/admin/products');
        router.refresh(); // Force a server-side refresh to reflect changes
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setFormError(error.message || 'An unexpected error occurred.');
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Enter the main details for your product.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My Awesome Product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., my-awesome-product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
                          ref={descriptionRef}
                          placeholder="Describe the product in detail..."
                          className="min-h-[150px]"
                        />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., T-Shirts" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>
                          Assign a category to group products together.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Best Seller, New Arrival" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags for product highlights.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ({currency})</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="99.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU-12345" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>SEO & Meta</CardTitle></CardHeader>
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
                            <FormDescription>If empty, the product name will be used.</FormDescription>
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
                                <Input placeholder="e.g., https://example.com/original-product" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormDescription>The canonical URL for this product to avoid duplicate content issues.</FormDescription>
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
                                Tell search engines not to show this product in search results.
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
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Feature Product</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                    {product?.slug && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> View Product
                            </Link>
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel>Image Library</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const selectedImage = PlaceHolderImages.find(
                        (img) => img.imageUrl === value
                      );
                      if (selectedImage) {
                        form.setValue('image.url', selectedImage.imageUrl);
                        form.setValue('image.hint', selectedImage.imageHint);
                      }
                    }}
                    defaultValue={imageUrl}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select from library" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PlaceHolderImages.map((img) => (
                        <SelectItem key={img.id} value={img.imageUrl}>
                          {img.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormField
                  control={form.control}
                  name="image.url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image.hint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Hint</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'red t-shirt'"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="aspect-square relative my-4 rounded-lg border bg-muted flex items-center justify-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Product image preview"
                      fill
                      className="object-contain rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
