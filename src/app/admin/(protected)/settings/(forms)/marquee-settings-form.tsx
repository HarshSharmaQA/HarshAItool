
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
import type { MarqueeSettings, MarqueeItem } from "@/lib/types";
import { updateMarqueeSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, Trash2, Plus, GripVertical, Wand2, Check, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/icons/Icon"; // Use the existing Icon component
import IconPickerContent from "./icon-picker";

const marqueeItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Text cannot be empty."),
  icon: z.string().optional(),
});

const marqueeSettingsSchema = z.object({
  enabled: z.boolean(),
  speed: z.number().min(1).max(100),
  direction: z.enum(['left', 'right']).optional(),
  items: z.array(marqueeItemSchema).min(1, "You must have at least one item."),
});

// Add a preview schema for better UX
const previewItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Text cannot be empty."),
  icon: z.string().optional(),
});

type MarqueeSettingsFormValues = z.infer<typeof marqueeSettingsSchema>;
type PreviewItem = z.infer<typeof previewItemSchema>;

interface MarqueeSettingsFormProps {
  settings: MarqueeSettings;
}

// Create a safer icon names filter
const getValidIconNames = (): string[] => {
  try {
    const keys = Object.keys(LucideIcons);
    return keys.filter(key => {
      // Filter out non-icon exports
      if (key === "createLucideIcon" || key === "default" || key === "__esModule") {
        return false;
      }

      const iconComponent = (LucideIcons as any)[key];
      // More permissive check for valid React components
      return (
        (typeof iconComponent === 'function' ||
          (typeof iconComponent === 'object' && iconComponent !== null)) &&
        iconComponent !== LucideIcons.createLucideIcon
      );
    }).sort(); // Sort alphabetically for better UX
  } catch (error) {
    console.error("Error getting icon names:", error);
    return [];
  }
};

export default function MarqueeSettingsForm({ settings }: MarqueeSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();
  const [iconNames, setIconNames] = useState<string[]>([]);

  // Get icon names only on client side to avoid SSR issues
  useEffect(() => {
    setIconNames(getValidIconNames());
  }, []);

  // Add a safety check for iconNames
  const safeIconNames = Array.isArray(iconNames) && iconNames.length > 0 ? iconNames : [];

  const form = useForm<MarqueeSettingsFormValues>({
    resolver: zodResolver(marqueeSettingsSchema),
    defaultValues: {
      enabled: settings?.enabled ?? false,
      speed: settings?.speed || 25,
      direction: settings?.direction || 'left',
      items: Array.isArray(settings?.items) && settings.items.length > 0
        ? settings.items
        : [{ id: crypto.randomUUID(), text: "", icon: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Initialize openPopovers array with empty array
  const [openPopovers, setOpenPopovers] = useState<boolean[]>([]);

  // Update openPopovers array when fields change
  useEffect(() => {
    setOpenPopovers(prev => {
      // If the length is different, create a new array with the correct length
      if (prev.length !== fields.length) {
        return Array(fields.length).fill(false);
      }
      return prev;
    });
  }, [fields.length]);

  // Ensure openPopovers is always properly initialized
  const getOpenPopoverState = (index: number) => {
    if (!openPopovers || index >= openPopovers.length) {
      return false;
    }
    return openPopovers[index];
  };

  const setOpenPopoverState = (index: number, isOpen: boolean) => {
    setOpenPopovers(prev => {
      // Ensure the array is large enough
      const newOpenState = [...prev];
      if (index >= newOpenState.length) {
        // Extend the array with false values
        newOpenState.length = index + 1;
        newOpenState.fill(false, prev.length);
      }
      newOpenState[index] = isOpen;
      return newOpenState;
    });
  };

  const speed = form.watch("speed");
  const direction = form.watch("direction");
  const items = form.watch("items");
  const enabled = form.watch("enabled");

  // Get preview items with safety checks
  const previewItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id || crypto.randomUUID(),
      text: item.text || "",
      icon: item.icon || undefined
    })).filter(item => item.text && item.text.trim() !== "");
  }, [items]);

  async function onSubmit(data: MarqueeSettingsFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }

    // Validate that we have at least one item with text if marquee is enabled
    if (data.enabled) {
      const hasValidItems = data.items.some(item => item.text && item.text.trim() !== "");
      if (!hasValidItems) {
        setFormError("You must have at least one item with text when the marquee is enabled.");
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('enabled', data.enabled ? 'on' : 'off');
      formData.append('speed', data.speed.toString());
      formData.append('direction', data.direction || 'left');
      formData.append('items', JSON.stringify(data.items));

      const result = await updateMarqueeSettings(idToken, formData);

      if (result.error) {
        setFormError(result.error);
      } else {
        toast({
          title: "Success",
          description: "Marquee settings updated successfully.",
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
    <Card className="shadow-md">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="bg-primary text-primary-foreground p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-percent h-5 w-5">
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              <path d="m15 9-6 6" />
              <path d="M9 9h.01" />
              <path d="M15 15h.01" />
            </svg>
          </span>
          <span>Top Banner Marquee</span>
        </CardTitle>
        <CardDescription>Manage the scrolling text banner at the top of your site.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Marquee</FormLabel>
                    <FormDescription>
                      Show the scrolling banner at the top of your site.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />



            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium">
                      <Wand2 className="h-5 w-5" />
                      Scroll Speed
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 w-full">
                        <Slider
                          min={5}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full sm:w-64"
                        />
                        <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full w-full sm:w-24 text-center whitespace-nowrap">
                          {speed} seconds
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Duration of one full scroll animation. Lower is faster.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Scroll Direction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-4 w-4">
                              <path d="m12 19-7-7 7-7" />
                              <path d="M19 12H5" />
                            </svg>
                            Left to Right
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-4 w-4">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                            Right to Left
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The direction the marquee will scroll.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <FormLabel className="text-lg font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list h-5 w-5">
                      <line x1="8" x2="21" y1="6" y2="6" />
                      <line x1="8" x2="21" y1="12" y2="12" />
                      <line x1="8" x2="21" y1="18" y2="18" />
                      <line x1="3" x2="3.01" y1="6" y2="6" />
                      <line x1="3" x2="3.01" y1="12" y2="12" />
                      <line x1="3" x2="3.01" y1="18" y2="18" />
                    </svg>
                    <span>Marquee Items</span>
                  </FormLabel>
                  <FormDescription>Add, remove, and reorder the items in your scrolling banner.</FormDescription>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => append({ id: crypto.randomUUID(), text: "", icon: "" })}
                  className="gap-1 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {Array.isArray(fields) && fields.length > 0 ? (
                  fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row items-start gap-3 p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0 mt-2" />
                      <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                        <FormField
                          control={form.control}
                          name={`items.${index}.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={`Item ${index + 1} text`} {...field} value={field.value ?? ''} className="w-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.icon`}
                            render={({ field }) => (
                              <FormItem>
                                <Popover open={getOpenPopoverState(index)} onOpenChange={(isOpen) => setOpenPopoverState(index, isOpen)}>
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
                                            <span className="truncate">{field.value}</span>
                                          </>
                                        ) : (
                                          <span className="text-muted-foreground">Select icon</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[250px] p-0" align="start">
                                    <Command shouldFilter={false}>
                                      <CommandInput
                                        placeholder="Search icon..."
                                        className="h-9"
                                        onValueChange={(value) => {
                                          // We can use a local state or ref to store the search term if needed
                                          // But since we are inside a map, we need a way to track search per popover
                                          // For simplicity, let's just render the first 50 icons if no search, 
                                          // or filter based on the input value.
                                          // However, CommandInput onValueChange might not be enough without state.
                                          // Let's use a simpler approach: render all but let Command handle filtering,
                                          // BUT limit the initial render count if possible? 
                                          // Actually, the best way is to use a virtual list or just limit the output.
                                          // Since we can't easily add state for *each* row's search term without a sub-component,
                                          // let's extract the IconPicker into a separate component.
                                        }}
                                      />
                                      <IconPickerContent
                                        iconNames={safeIconNames}
                                        selectedIcon={field.value || ""}
                                        onSelect={(iconName) => {
                                          form.setValue(`items.${index}.icon`, iconName === field.value ? "" : iconName);
                                          setOpenPopoverState(index, false);
                                        }}
                                      />
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center justify-end sm:justify-start">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="flex-shrink-0 mt-0">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No marquee items added yet. Click "Add Item" to get started.</p>
                  </div>
                )}
                <FormMessage>{form.formState.errors?.items?.message}</FormMessage>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Save Marquee Settings</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
