
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Coupon } from "@/lib/types";
import { createCoupon, updateCoupon } from "@/app/actions/coupon-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/components/providers/app-providers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const couponFormSchema = z.object({
  code: z.string().min(1, "Code is required").regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only."),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, "Value must be a positive number"),
  status: z.enum(['active', 'inactive']),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon?: Coupon | null;
}

export default function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || "",
      type: coupon?.type || "percentage",
      value: coupon?.value || 0,
      status: coupon?.status || 'active',
    },
  });
  
  const discountType = form.watch("type");

  async function onSubmit(data: CouponFormValues) {
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
            formData.append(key, String(value));
        });

        const result = coupon
          ? await updateCoupon(idToken, coupon.id, formData)
          : await createCoupon(idToken, formData);

        if (result?.error) {
            setFormError(result.error);
        } else {
          toast({
            title: "Success",
            description: coupon ? "Coupon updated successfully." : "Coupon created successfully.",
          });
          router.push("/admin/marketing/coupons");
          router.refresh();
        }
    } catch (error: any) {
        setFormError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{coupon ? "Edit Coupon" : "Create Coupon"}</CardTitle>
        <CardDescription>Manage discount coupons for your store.</CardDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., SUMMER25" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormDescription>The code customers will enter at checkout.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Only active coupons can be used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder={discountType === 'percentage' ? '25' : '500'} {...field} />
                    </FormControl>
                    <FormDescription>
                        {discountType === 'percentage' ? 'The percentage discount (e.g., 25 for 25%).' : 'The fixed amount discount.'}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
