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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@/lib/types";
import { updateAdminMenu } from "@/app/actions/admin-menu-actions";
import { Loader2, AlertCircle, GripVertical, Plus, Trash2, Check, ChevronsUpDown, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Icon from "@/components/icons/Icon";

// Zod schema for individual menu link
const linkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Href is required"),
  icon: z.string().min(1, "Icon is required"),
  external: z.boolean().optional(),
});

// Zod schema for the entire form
const adminMenuSchema = z.object({
  links: z.array(linkSchema).default([]),
});

type LinkFormValues = z.infer<typeof linkSchema>;
type AdminMenuFormValues = z.infer<typeof adminMenuSchema>;

interface AdminMenuFormProps {
  menuItems: MenuItem[];
}

// Utility function to get icon component safely
export const getIconComponent = (name: string) => {
  try {
    // First try direct mapping
    if (name in LucideIcons) {
      const iconComponent = LucideIcons[name as keyof typeof LucideIcons];
      // Check if it's a valid React component and not the create function
      if (
        (typeof iconComponent === 'function' || 
         (typeof iconComponent === 'object' && iconComponent !== null && '$$typeof' in iconComponent)) &&
        iconComponent !== LucideIcons.createLucideIcon
      ) {
        return iconComponent;
      }
    }
    
    // Fallback to Link icon if not found
    return LucideIcons.Link;
  } catch (error) {
    // Return fallback icon on any error
    return LucideIcons.Link;
  }
};

// Get all valid icon names from LucideIcons with error handling
const getValidIconNames = (): string[] => {
  try {
    const keys = Object.keys(LucideIcons);
    return keys.filter((key) => {
      // Filter out non-icon exports
      if (key === "createLucideIcon" || key === "default" || key === "__esModule") {
        return false;
      }
      
      // Use our utility function to check if it's a valid icon
      const iconComponent = getIconComponent(key);
      return iconComponent !== LucideIcons.Link || key === "Link"; // Allow Link as a valid icon
    }).sort(); // Sort alphabetically for better UX
  } catch (error) {
    console.error("Error getting icon names:", error);
    return ["Link"]; // Fallback to at least one icon
  }
};

export default function AdminMenuForm({ menuItems = [] }: AdminMenuFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openPopovers, setOpenPopovers] = useState<boolean[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Memoize icon names to prevent recalculation
  const iconNames = useMemo(() => getValidIconNames(), []);
  
  // Transform menuItems to form-compatible format with defensive checks
  const transformMenuItems = (items: MenuItem[]): LinkFormValues[] => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      label: item.label || "",
      href: item.path || "",
      icon: item.icon || "Link",
      external: item.external || false,
    }));
  };
  
  // Initialize form with safe defaults
  const form = useForm<AdminMenuFormValues>({
    resolver: zodResolver(adminMenuSchema),
    defaultValues: {
      links: transformMenuItems(menuItems),
    },
  });
  
  // Get field array with defensive checks
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "links",
  });
  
  // Watch links field with safe fallback
  const watchedLinks = form.watch("links") ?? [];
  
  // Initialize openPopovers array when fields change with defensive checks
  useEffect(() => {
    const safeFields = Array.isArray(fields) ? fields : [];
    setOpenPopovers(Array(safeFields.length).fill(false));
  }, [fields.length]);
  
  // Safe getter for popover state
  const getPopoverState = (index: number): boolean => {
    if (!Array.isArray(openPopovers) || index >= openPopovers.length) {
      return false;
    }
    return openPopovers[index] ?? false;
  };
  
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
    setDraggedIndex(index);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    const draggedIdx = parseInt(e.dataTransfer.getData("draggedIndex"), 10);
    if (!isNaN(draggedIdx) && draggedIdx !== dropIndex) {
      move(draggedIdx, dropIndex);
    }
    setDraggedIndex(null);
  };

  async function onSubmit(data: AdminMenuFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('links', JSON.stringify(data.links));
      
      const result = await updateAdminMenu(idToken, formData);

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
  
  // Safe append with default values
  const handleAppend = () => {
    append({
      id: crypto.randomUUID(),
      label: '',
      href: '',
      icon: 'Link',
      external: false,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Sidebar Menu</CardTitle>
            <CardDescription>Manage the main navigation for the admin dashboard. Drag and drop items to reorder them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
              {/* Safe mapping with defensive checks */}
              {Array.isArray(fields) && fields.length > 0 ? (
                fields.map((field, index) => (
                  <div 
                    key={field.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDrop={(e) => onDrop(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg bg-muted/20",
                      draggedIndex === index && "opacity-50 ring-2 ring-primary"
                    )}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <FormField 
                        control={form.control} 
                        name={`links.${index}.label`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Dashboard" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name={`links.${index}.href`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Path</FormLabel>
                            <FormControl>
                              <Input placeholder="/admin/dashboard" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField
                        control={form.control}
                        name={`links.${index}.icon`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Icon</FormLabel>
                            <Popover 
                              open={getPopoverState(index)} 
                              onOpenChange={(isOpen) => {
                                const newOpenState = [...openPopovers];
                                // Ensure array is large enough
                                while (newOpenState.length <= index) {
                                  newOpenState.push(false);
                                }
                                newOpenState[index] = isOpen;
                                setOpenPopovers(newOpenState);
                              }}
                            >
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
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Search icon..." />
                                  <CommandEmpty>No icon found.</CommandEmpty>
                                  <CommandGroup className="max-h-64 overflow-y-auto">
                                    {Array.isArray(iconNames) && iconNames.length > 0 ? (
                                      iconNames.map((iconName) => {
                                        return (
                                          <CommandItem
                                            value={iconName}
                                            key={iconName}
                                            onSelect={() => {
                                              form.setValue(`links.${index}.icon`, iconName);
                                              // Close popover
                                              const newOpenState = [...openPopovers];
                                              if (index < newOpenState.length) {
                                                newOpenState[index] = false;
                                              }
                                              setOpenPopovers(newOpenState);
                                            }}
                                          >
                                            <Check className={cn(
                                              "mr-2 h-4 w-4", 
                                              field.value === iconName ? "opacity-100" : "opacity-0"
                                            )} />
                                            <Icon name={iconName} className="mr-2 h-4 w-4" />
                                            {iconName}
                                          </CommandItem>
                                        );
                                      })
                                    ) : (
                                      <CommandItem disabled>
                                        <span>No icons available</span>
                                      </CommandItem>
                                    )}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`links.${index}.external`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center justify-center space-y-2 pt-5">
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> External
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No menu items yet. Add your first item below.
                </div>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAppend}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Admin Menu
        </Button>
      </form>
    </Form>
  );
}