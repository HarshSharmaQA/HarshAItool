
"use client";

import { useFieldArray, useForm, useFormContext, Control } from "react-hook-form";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Menu, MenuItem as MenuItemType } from "@/lib/types";
import { updateMenu } from "@/app/actions/menu-actions";
import { Loader2, GripVertical, Plus, Trash2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Define recursive type for deeply nested link structures
// This allows us to properly type nested form fields
type LinkSchema = z.infer<typeof linkSchema>;

const baseLinkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required."),
  order: z.number(),
  isGroup: z.boolean().optional(),
  path: z.string().optional(),
});

const linkSchema: z.ZodType<any> = baseLinkSchema
  .extend({
    links: z.lazy(() => linkSchema.array()).optional(),
  })
  .refine(
    (data) => {
      if (data.isGroup) {
        return true; // Path is optional for groups
      }
      // Path is required for non-groups
      return typeof data.path === 'string' && data.path.length > 0;
    },
    {
      message: "Path is required for non-group items.",
      path: ['path'],
    }
  );

const menuFormSchema = z.object({
  title: z.string().optional(),
  links: z.array(linkSchema),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

// Define specific types for different field name patterns
type FieldName = "title" | "links";
type LinkFieldName = 
  | `links.${number}.label`
  | `links.${number}.path`
  | `links.${number}.isGroup`
  | `links.${number}.links`;

type NestedLinkFieldName = 
  | `links.${number}.links.${number}.label`
  | `links.${number}.links.${number}.path`
  | `links.${number}.links.${number}.isGroup`
  | `links.${number}.links.${number}.links`;

type DeepNestedLinkFieldName = 
  | `links.${number}.links.${number}.links.${number}.label`
  | `links.${number}.links.${number}.links.${number}.path`
  | `links.${number}.links.${number}.links.${number}.isGroup`;

type AllNestedFieldNames = LinkFieldName | NestedLinkFieldName | DeepNestedLinkFieldName;

interface MenuFormProps {
  menu: Menu;
}

function NestedLink({ control, index, remove, parentName, depth }: { control: Control<MenuFormValues>, index: number, remove: (index: number) => void, parentName: string, depth: number }) {
  const { fields, append, remove: removeChild, move } = useFieldArray({
    control,
    name: `${parentName}.${index}.links` as LinkFieldName,
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const { watch, setValue } = useFormContext<MenuFormValues>();
  const isGroup = watch(`${parentName}.${index}.isGroup` as AllNestedFieldNames);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();
    e.dataTransfer.setData("draggedData", JSON.stringify({ index: idx, parentName: `${parentName}.${index}.links` }));
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.stopPropagation();
    try {
        const draggedData = JSON.parse(e.dataTransfer.getData("draggedData"));
        if (draggedData.parentName === `${parentName}.${index}.links`) {
            move(draggedData.index, dropIndex);
        }
    } catch(e) {
      console.error(e)
    }
  };
  
  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
        {(fields.length > 0 || isGroup) && (
             <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6"
            >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
            <FormField
                control={control}
                name={`${parentName}.${index}.label` as AllNestedFieldNames}
                render={({ field }) => (
                <FormItem>
                    <FormControl><Input placeholder="Link Label" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {!isGroup && (
                <FormField
                    control={control}
                    name={`${parentName}.${index}.path` as AllNestedFieldNames}
                    render={({ field }) => (
                    <FormItem>
                        <FormControl><Input placeholder="Path (e.g., /about)" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
        </div>
        <FormField
            control={control}
            name={`${parentName}.${index}.isGroup` as AllNestedFieldNames}
            render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        setValue(`${parentName}.${index}.path` as AllNestedFieldNames, '');
                      }
                    }}
                    />
                </FormControl>
                <FormLabel className="text-xs">
                    Is Group
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

      {isExpanded && (fields.length > 0 || isGroup) && (
        <div className="pl-12 space-y-2" onDragOver={(e) => e.preventDefault()}>
            {fields.map((item, childIndex) => (
                 <div key={item.id} draggable onDragStart={(e) => onDragStart(e, childIndex)} onDrop={(e) => onDrop(e, childIndex)}>
                    <NestedLink
                        control={control}
                        index={childIndex}
                        remove={removeChild}
                        parentName={`${parentName}.${index}.links`}
                        depth={depth + 1}
                    />
                 </div>
            ))}
            {isGroup && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), label: "", path: "", order: fields.length, links: [] })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Sub-item
                </Button>
            )}
        </div>
      )}
    </div>
  )
}

export default function MenuForm({ menu }: MenuFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      title: menu.title,
      links: menu.links || [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedData", JSON.stringify({ index, parentName: "links" }));
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    try {
      const draggedData = JSON.parse(e.dataTransfer.getData("draggedData"));
      if (draggedData.parentName === "links") {
          move(draggedData.index, dropIndex);
      }
    } catch(e) {
      console.error(e);
    }
  };

  async function onSubmit(data: MenuFormValues) {
    if (!user) {
        setFormError("You must be logged in to perform this action.");
        return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
        const idToken = await user.getIdToken();
        const formData = new FormData();
        formData.append("id", menu.id);
        
        formData.append("links", JSON.stringify(data.links));
        if (data.title) {
          formData.append("title", data.title);
        }

        const result = await updateMenu(idToken, formData);

        if (result.error) {
            console.log(result.details)
            setFormError(result.error);
        } else {
            toast({
                title: "Success",
                description: result.success,
            });
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
    <Card>
      <CardHeader>
        <CardTitle>{menu.title || menu.id.charAt(0).toUpperCase() + menu.id.slice(1)} Menu</CardTitle>
        <CardDescription>Manage the navigation links for the {menu.id}. Drag and drop to reorder.</CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {menu.id === 'footer' && (
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Menu Title</FormLabel>
                        <FormControl><Input placeholder="e.g. Resources" {...field} /></FormControl>
                        <FormDescription>An optional title for the menu (e.g., for footer sections).</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
            <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDrop={(e) => onDrop(e, index)}
                >
                    <NestedLink
                      control={form.control}
                      index={index}
                      remove={remove}
                      parentName="links"
                      depth={0}
                    />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                    append({ id: crypto.randomUUID(), label: "", path: "", order: fields.length, links: [] })}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Top-level Link
                </Button>
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save {menu.id.charAt(0).toUpperCase() + menu.id.slice(1)} Menu
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
