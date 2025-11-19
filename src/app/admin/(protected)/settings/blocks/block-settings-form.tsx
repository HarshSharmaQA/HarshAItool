
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { BlockSettings } from "@/lib/types";
import { updateBlockSettings } from "@/app/actions/block-settings-actions";
import { Loader2, AlertCircle, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Slider } from "@/components/ui/slider";

const blockSettingsSchema = z.object({
  animationSpeed: z.coerce.number().min(1).max(100),
});

type BlockSettingsFormValues = z.infer<typeof blockSettingsSchema>;

interface BlockSettingsFormProps {
  settings: BlockSettings;
}

export default function BlockSettingsForm({ settings }: BlockSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<BlockSettingsFormValues>({
    resolver: zodResolver(blockSettingsSchema),
    defaultValues: {
      animationSpeed: settings?.animationSpeed || 25,
    },
  });
  
  const animationSpeed = form.watch("animationSpeed");

  async function onSubmit(data: BlockSettingsFormValues) {
    if (!user) {
      setFormError("You must be logged in to perform this action.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('animationSpeed', data.animationSpeed.toString());
      
      const result = await updateBlockSettings(idToken, formData);

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
            <CardTitle>Block Settings</CardTitle>
            <CardDescription>Manage global settings for content blocks, like animations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="animationSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Logo Carousel Speed
                  </FormLabel>
                  <FormControl>
                     <div className="flex items-center gap-4">
                        <Slider
                            min={5}
                            max={50}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-64"
                        />
                        <span className="text-sm font-medium text-muted-foreground w-24">
                           {animationSpeed} seconds
                        </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Duration of the logo carousel's infinite scroll animation. Lower is faster.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Block Settings
        </Button>
      </form>
    </Form>
  );
}
