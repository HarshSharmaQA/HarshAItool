
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import type { EmailTemplate } from "@/lib/types";
import { updateEmailTemplate } from "@/app/actions/email-settings-actions";
import { Loader2, AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getFunctions, httpsCallable } from "firebase/functions";

const emailTemplateSchema = z.object({
  id: z.enum(["contact-form", "new-subscriber", "new-post"]),
  subject: z.string().min(1, "Subject is required."),
  body: z.string().min(1, "Body is required."),
});

type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

interface EmailTemplatesFormProps {
  templates: EmailTemplate[];
}

function EmailTemplateForm({ template }: { template: EmailTemplate }) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      id: template.id,
      subject: template.subject,
      body: template.body,
    },
  });

  // Watch the body field for real-time preview
  const bodyContent = form.watch("body");

  async function onSubmit(data: EmailTemplateFormValues) {
    if (!user) {
      setFormError("You must be logged in.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
      const idToken = await user.getIdToken();
      const result = await updateEmailTemplate(idToken, data);

      if (result.error) {
        setFormError(result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({ title: "Success", description: "Email template saved." });
      }
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSendTest = async () => {
    if (!user?.email) {
      toast({ variant: "destructive", title: "Error", description: "User email not found." });
      return;
    }
    setIsSendingTest(true);
    try {
      const functions = getFunctions();
      const sendTestEmail = httpsCallable(functions, 'sendTestEmail');
      await sendTestEmail({ templateId: template.id, recipientEmail: user.email });
      toast({ title: "Test Email Sent", description: `A test email has been sent to ${user.email}.` });
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({ variant: "destructive", title: "Failed to Send Test Email", description: error.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Save Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col">
                  <FormLabel>Body (HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[400px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium mr-2">Placeholders:</span>
              {template.placeholders.map(p => <Badge variant="outline" key={p}>{`{{${p}}}`}</Badge>)}
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <FormLabel>Live Preview</FormLabel>
            <div className="border rounded-md w-full h-[500px] bg-white overflow-hidden flex flex-col">
              <div className="bg-gray-100 border-b p-2 text-xs text-gray-500 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2">Email Preview</span>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyContent || '<p class="text-gray-400 italic">Start typing to see preview...</p>' }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Actual email rendering may vary slightly depending on the email client.
            </p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleSendTest} disabled={isSendingTest}>
            {isSendingTest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Test Email
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function EmailTemplatesForm({ templates }: EmailTemplatesFormProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>
          Customize the automated emails sent from your website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {templates.map((template) => (
            <AccordionItem value={template.id} key={template.id} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
                {template.title}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 border-t bg-muted/30">
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <EmailTemplateForm template={template} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
