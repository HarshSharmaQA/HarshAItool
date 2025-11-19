
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createSubscription } from "@/app/actions/subscriber-actions";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { NewsletterBlock } from "@/lib/types";

const newsletterFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export default function NewsletterSection(props: NewsletterBlock) {
  const { title, subtitle, ctaText } = props;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    
    try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);

        const result = await createSubscription(formData);

        if (result.error) {
            setFormError(result.error);
        } else {
            setFormSuccess(result.success || "You've been subscribed!");
            toast({
                title: "Success",
                description: result.success,
            });
            form.reset();
        }
    } catch (error: any) {
        setFormError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-headline tracking-tight sm:text-4xl">
              {title || "Subscribe to our Newsletter"}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {subtitle || "Get the latest news, articles, and resources, sent to your inbox weekly."}
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-4 max-w-lg mx-auto">
                    {formError && (
                      <Alert variant="destructive" className="mt-4 text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Subscription Failed</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                     {formSuccess && (
                      <Alert variant="default" className="mt-4 text-left bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700 text-green-800 dark:text-green-300 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>{formSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} className="h-12 text-base"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} className="h-12 text-base"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {ctaText || 'Subscribe'}
                    </Button>
                </form>
            </Form>
        </div>
      </div>
    </section>
  );
}


    