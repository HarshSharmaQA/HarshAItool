
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
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
import type { NotificationPopupSettings } from "@/lib/types";
import { updateNotificationPopupSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, Check, ChevronsUpDown, ImageIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Icon from "@/components/icons/Icon"; // Use the shared Icon component

const iconNames = Object.keys(LucideIcons).filter(key => {
  // Filter out non-icon exports
  if (key === "createLucideIcon" || key === "default" || key === "__esModule") {
    return false;
  }
  
  const iconComponent = (LucideIcons as any)[key];
  // Check if it's a valid React component (could be function or object with render property)
  // and not the create function
  return (
    (typeof iconComponent === 'function' || 
     (typeof iconComponent === 'object' && iconComponent !== null && '$$typeof' in iconComponent)) &&
    iconComponent !== LucideIcons.createLucideIcon
  );
});

const notificationPopupSchema = z.object({
  enabled: z.boolean(),
  title: z.string().optional(),
  message: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  delaySeconds: z.coerce.number().min(0).optional(),
  dismissalDuration: z.enum(['session', 'day', 'week']).optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});

type FormValues = z.infer<typeof notificationPopupSchema>;

interface NotificationPopupSettingsFormProps {
  settings: NotificationPopupSettings;
}

export default function NotificationPopupSettingsForm({ settings }: NotificationPopupSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(notificationPopupSchema),
    defaultValues: {
      enabled: settings?.enabled ?? false,
      title: settings?.title || "",
      message: settings?.message || "",
      ctaText: settings?.ctaText || "",
      ctaLink: settings?.ctaLink || "",
      delaySeconds: settings?.delaySeconds || 2,
      dismissalDuration: settings?.dismissalDuration || 'session',
      icon: settings?.icon || 'Megaphone',
      imageUrl: settings?.imageUrl || "",
      imageHint: settings?.imageHint || "",
    },
  });

  const isEnabled = form.watch("enabled");
  const imageUrl = form.watch("imageUrl");

  async function onSubmit(data: FormValues) {
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
      formData.append('title', data.title || "");
      formData.append('message', data.message || "");
      formData.append('ctaText', data.ctaText || "");
      formData.append('ctaLink', data.ctaLink || "");
      formData.append('delaySeconds', (data.delaySeconds || 0).toString());
      formData.append('dismissalDuration', data.dismissalDuration || 'session');
      formData.append('icon', data.icon || "");
      formData.append('imageUrl', data.imageUrl || "");
      formData.append('imageHint', data.imageHint || "");

      const result = await updateNotificationPopupSettings(idToken, formData);

      if (result.error) {
          setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: "Notification Popup settings updated successfully.",
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
        <CardTitle>Notification Popup</CardTitle>
        <CardDescription>Manage the global notification pop-up for your site.</CardDescription>
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
                    <FormLabel className="text-base">Enable Notification Popup</FormLabel>
                    <FormDescription>
                      Show a notification pop-up to visitors.
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
            
            {isEnabled && (
              <div className="space-y-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-6">
                        <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Icon</FormLabel>
                            <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        <>
                                            <Icon name={field.value} className="mr-2 h-4 w-4" />
                                            {field.value}
                                        </>
                                    ) : (
                                        "Select icon"
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search icon..." />
                                    <CommandEmpty>No icon found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-y-auto">
                                    {iconNames.length > 0 ? (
                                      iconNames.map((iconName) => (
                                          <CommandItem
                                          value={iconName}
                                          key={iconName}
                                          onSelect={() => {
                                              form.setValue('icon', iconName);
                                              setIsIconPopoverOpen(false);
                                          }}
                                          >
                                          <Check className={cn("mr-2 h-4 w-4", field.value === iconName ? "opacity-100" : "opacity-0")} />
                                          <Icon name={iconName} className="mr-2 h-4 w-4" />
                                          {iconName}
                                          </CommandItem>
                                      ))
                                    ) : (
                                      <CommandItem disabled>
                                          <span>No icons available</span>
                                      </CommandItem>
                                    )}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>Select an icon to display in the popup.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Special Announcement" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />

                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl><Textarea placeholder="Describe your announcement here." {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="space-y-4">
                        <FormItem>
                            <FormLabel>Image Library</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    const selectedImage = PlaceHolderImages.find(img => img.imageUrl === value);
                                    if (selectedImage) {
                                        form.setValue('imageUrl', selectedImage.imageUrl);
                                        form.setValue('imageHint', selectedImage.imageHint);
                                    }
                                }}
                                defaultValue={imageUrl}
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
                            name="imageUrl"
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
                         {imageUrl ? (
                             <div className="aspect-video relative my-4 rounded-lg overflow-hidden border">
                                <Image
                                    src={imageUrl}
                                    alt="Popup image preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="aspect-video my-4 rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mt-2">Image Preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="ctaText" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl><Input placeholder="e.g., Learn More" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="ctaLink" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Button Link</FormLabel>
                        <FormControl><Input placeholder="/blog/my-announcement" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="delaySeconds" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Appearance Delay (seconds)</FormLabel>
                            <FormControl><Input type="number" placeholder="2" {...field} /></FormControl>
                            <FormDescription>How long to wait before showing the popup.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="dismissalDuration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dismissal Duration</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select dismissal duration" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="session">For this session</SelectItem>
                                <SelectItem value="day">For 1 day</SelectItem>
                                <SelectItem value="week">For 1 week</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>How long the popup stays dismissed for a user.</FormDescription>
                            <FormMessage />
                        </FormItem>
                     )} />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notification Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
