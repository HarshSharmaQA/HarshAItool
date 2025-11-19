
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@/lib/types";
import { updateSettings } from "@/app/actions/settings-actions";
import { Loader2, AlertCircle, Sun, Moon, Laptop, Flame } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const themeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system', 'dramatic']),
});

type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;

interface ThemeSettingsFormProps {
  settings: Settings;
}

export default function ThemeSettingsForm({ settings }: ThemeSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();
  const { setTheme } = useTheme();

  const form = useForm<ThemeSettingsFormValues>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      theme: settings.theme || "system",
    },
  });

  async function handleThemeChange(theme: 'light' | 'dark' | 'system' | 'dramatic') {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }
    
    // Optimistically update the client-side theme
    setTheme(theme);
    form.setValue('theme', theme);

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('theme', theme);
      
      const result = await updateSettings(idToken, formData);

      if (result.error) {
          setFormError(result.error);
          // Revert optimistic update if there's an error
          setTheme(settings.theme || "system");
          form.setValue('theme', settings.theme || "system");
      } else {
        toast({
          title: "Success",
          description: "Theme updated successfully.",
        });
        router.refresh();
      }
    } catch (error: any) {
        setFormError(error.message || "An unexpected error occurred.");
        // Revert optimistic update on exception
        setTheme(settings.theme || "system");
        form.setValue('theme', settings.theme || "system");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Manage the look and feel of your entire website.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            {formError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Failed</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
            
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Website Theme</FormLabel>
                      <FormDescription>
                        Select a theme for the entire site. This will be the default for all visitors.
                      </FormDescription>
                    </div>
                     {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: 'light' | 'dark' | 'system' | 'dramatic') => handleThemeChange(value)}
                      defaultValue={field.value}
                      className="grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4"
                      disabled={isSubmitting}
                    >
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="light" className="sr-only" />
                          </FormControl>
                          <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent flex flex-col justify-center">
                            <Sun className="mb-2 h-6 w-6" />
                            <span className="block w-full text-center font-normal">Light</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                         <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                           <FormControl>
                             <RadioGroupItem value="dark" className="sr-only" />
                           </FormControl>
                           <div className="items-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground flex flex-col justify-center">
                             <Moon className="mb-2 h-6 w-6" />
                             <span className="block w-full text-center font-normal">Dark</span>
                           </div>
                         </FormLabel>
                      </FormItem>
                      <FormItem>
                         <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                           <FormControl>
                             <RadioGroupItem value="dramatic" className="sr-only" />
                           </FormControl>
                           <div className="items-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground flex flex-col justify-center">
                             <Flame className="mb-2 h-6 w-6" />
                             <span className="block w-full text-center font-normal">Dramatic</span>
                           </div>
                         </FormLabel>
                      </FormItem>
                      <FormItem>
                         <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                           <FormControl>
                             <RadioGroupItem value="system" className="sr-only" />
                           </FormControl>
                           <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent flex flex-col justify-center">
                            <Laptop className="mb-2 h-6 w-6" />
                             <span className="block w-full text-center font-normal">System</span>
                           </div>
                         </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
