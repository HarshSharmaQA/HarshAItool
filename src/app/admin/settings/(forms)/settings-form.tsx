
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
import type { Settings } from "@/lib/types";
import { updateSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, Image as ImageIcon, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Textarea } from "@/components/ui/textarea";

const settingsFormSchema = z.object({
  siteTitle: z.string().min(2, {
    message: "Site title must be at least 2 characters.",
  }),
  siteDescription: z.string().min(10, {
    message: "Site description must be at least 10 characters.",
  }),
  siteLogoUrl: z.string().url("Must be a valid URL for the logo.").optional().or(z.literal('')),
  faviconUrl: z.string().url("Must be a valid URL for the favicon.").optional().or(z.literal('')),
  googleAnalyticsId: z.string().optional(),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialLinkedin: z.string().url().optional().or(z.literal('')),
  socialYoutube: z.string().url().optional().or(z.literal('')),
  customHeadContent: z.string().optional(),
  copyrightText: z.string().optional(),
  currency: z.string().max(5, "Currency symbol should be short.").optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  settings: Settings;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      siteTitle: settings.siteTitle || "",
      siteDescription: settings.siteDescription || "",
      siteLogoUrl: settings.siteLogoUrl || "",
      faviconUrl: settings.faviconUrl || "",
      googleAnalyticsId: settings.googleAnalyticsId || "G-E7HVMLPNDF",
      socialTwitter: settings.socialTwitter || "",
      socialFacebook: settings.socialFacebook || "",
      socialInstagram: settings.socialInstagram || "",
      socialLinkedin: settings.socialLinkedin || "",
      socialYoutube: settings.socialYoutube || "",
      customHeadContent: settings.customHeadContent || "",
      copyrightText: settings.copyrightText || "",
      currency: settings.currency || "₹",
    },
  });

  const logoUrl = form.watch("siteLogoUrl");
  const faviconUrl = form.watch("faviconUrl");
  const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'logo-placeholder')?.imageUrl;


  async function onSubmit(data: SettingsFormValues) {
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
        // Only append if value is not undefined or null. Allow empty strings.
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const result = await updateSettings(idToken, formData);

      if (result.error) {
          setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: "Settings updated successfully.",
        });
        router.refresh();
      }
    } catch (error: any) {
        console.error("Error getting ID token or updating settings:", error);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage the main identifiers for your website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="siteTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Awesome Site" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        The name of your website, used in browser tabs and metadata.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Input placeholder="A fantastic site about..." {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        A short description of your site for search engines.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="copyrightText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Copyright Text</FormLabel>
                      <FormControl>
                        <Input placeholder="© {year} {siteTitle}. All rights reserved." {...field} value={field.value ?? ''}/>
                      </FormControl>
                      <FormDescription>
                        Use {'{year}'} and {'{siteTitle}'} as placeholders.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="₹" {...field} value={field.value ?? '₹'} />
                      </FormControl>
                      <FormDescription>
                        The currency symbol to display for products (e.g., ₹, $, €).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Manage your site's logo and favicon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="siteLogoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        URL for your site logo. If left blank, a default logo will be used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faviconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/favicon.ico" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        URL for your site favicon. Should be a .ico, .png, or .svg file.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <FormLabel>Logo Preview</FormLabel>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 w-48 h-24 flex items-center justify-center relative">
                            {(logoUrl || logoPlaceholder) ? (
                                <Image 
                                    src={logoUrl || logoPlaceholder!} 
                                    alt="Logo Preview"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-muted-foreground text-sm">No logo</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <FormLabel>Favicon Preview</FormLabel>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 w-24 h-24 flex items-center justify-center">
                            {faviconUrl ? (
                                <Image 
                                    src={faviconUrl} 
                                    alt="Favicon Preview" 
                                    width={48} 
                                    height={48}
                                    className="object-contain"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImageIcon className="h-8 w-8"/>
                                    <span className="text-sm text-center">No favicon set</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics & SEO</CardTitle>
                <CardDescription>Configure tracking and search engine optimization settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="googleAnalyticsId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Analytics ID</FormLabel>
                      <FormControl>
                        <Input placeholder="G-XXXXXXXXXX" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Your Google Analytics Measurement ID.
                      </FormDescription>
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
                        <FormDescription>Global raw HTML to be injected into the document's &lt;head&gt; on all pages.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Links to your social media profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="socialTwitter" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Twitter className="h-4 w-4 mr-2" /> Twitter</FormLabel>
                    <FormControl><Input placeholder="https://twitter.com/username" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="socialFacebook" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Facebook className="h-4 w-4 mr-2" /> Facebook</FormLabel>
                    <FormControl><Input placeholder="https://facebook.com/username" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="socialInstagram" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Instagram className="h-4 w-4 mr-2" /> Instagram</FormLabel>
                    <FormControl><Input placeholder="https://instagram.com/username" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="socialLinkedin" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Linkedin className="h-4 w-4 mr-2" /> LinkedIn</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/in/username" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="socialYoutube" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Youtube className="h-4 w-4 mr-2" /> YouTube</FormLabel>
                    <FormControl><Input placeholder="https://youtube.com/c/channelname" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}
