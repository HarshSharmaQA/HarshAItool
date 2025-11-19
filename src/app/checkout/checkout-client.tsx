
'use client';

import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/components/providers/app-providers';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Settings } from '@/lib/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/components/image-with-fallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { validateCoupon } from '@/app/actions/coupon-actions';
import type { Coupon } from '@/lib/types';

const checkoutSchema = z.object({
    email: z.string().email(),
    shippingAddress: z.object({
        name: z.string().min(1, "Name is required"),
        address1: z.string().min(1, "Address is required"),
        address2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "Zip code is required"),
        country: z.string().min(1, "Country is required"),
        phone: z.string().min(1, "Phone number is required"),
    })
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutClientPageProps {
  settings: Settings;
}

export default function CheckoutClientPage({ settings }: CheckoutClientPageProps) {
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();
    const { user, loading, isAdmin } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discount, setDiscount] = useState(0);
    const currency = settings?.currency || '₹';

    const finalTotal = cartTotal - discount;

    const handleApplyCoupon = async () => {
        setCouponError(null);
        setIsApplyingCoupon(true);
        try {
            const result = await validateCoupon(couponCode);
            if (result.valid && result.coupon) {
                setAppliedCoupon(result.coupon as Coupon);
                if (result.coupon.type === 'percentage') {
                    setDiscount(cartTotal * (result.coupon.value / 100));
                } else {
                    setDiscount(result.coupon.value);
                }
                toast({ title: "Coupon Applied", description: `Discount of ${result.coupon.type === 'percentage' ? `${result.coupon.value}%` : `${currency}${result.coupon.value}`} applied.` });
            } else {
                setCouponError(result.error || "Invalid coupon code.");
            }
        } catch (error: any) {
            setCouponError("Failed to apply coupon.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };


    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            email: user?.email || '',
            shippingAddress: {
                name: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                country: 'India',
                phone: '',
            },
        },
    });

    useEffect(() => {
        if (user?.email) {
            form.setValue('email', user.email);
        }
    }, [user, form]);
    
    if (cartCount === 0 && !isSubmitting) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    async function onSubmit(data: CheckoutFormValues) {
        setIsSubmitting(true);
        setFormError(null);
        
        if (!db) {
            setFormError("Database connection not found.");
            setIsSubmitting(false);
            return;
        }

        try {
            const orderData = {
                ...data,
                userId: user?.uid || null,
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                })),
                total: finalTotal,
                discount: discount,
                couponCode: appliedCoupon?.code || '',
                status: 'pending' as const,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
            
            toast({
                title: "Order Placed!",
                description: `Your order #${docRef.id.slice(0,7)} has been placed successfully.`,
            });
            
            clearCart();
            
            const redirectUrl = isAdmin ? `/admin/orders` : `/order/${docRef.id}`;
            router.push(redirectUrl);

        } catch(error: any) {
            console.error("Order submission error:", error);
            setFormError("Failed to place order. Please try again.");
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="max-w-md mx-auto text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                           <UserCheck /> Please Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            You need to be logged in to proceed with your order.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button asChild>
                             <Link href="/login?redirect=/checkout">Login or Create Account</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }


    return (
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <h2 className="text-2xl font-semibold mb-6">Your Order</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-md border overflow-hidden">
                                     <ImageWithFallback src={item.image.url} alt={item.name} fill className="object-cover" unoptimized/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{item.price > 0 ? `${currency}${(item.price * item.quantity).toFixed(2)}` : 'Free'}</p>
                            </div>
                        ))}
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{cartTotal > 0 ? `${currency}${cartTotal.toFixed(2)}` : 'Free'}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-{currency}{discount.toFixed(2)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                              <span>Total</span>
                              <span>{finalTotal > 0 ? `${currency}${finalTotal.toFixed(2)}` : 'Free'}</span>
                          </div>
                        </div>
                         <div className="space-y-2 pt-4">
                            <Label htmlFor="coupon">Coupon Code</Label>
                            <div className="flex space-x-2">
                                <Input 
                                    id="coupon" 
                                    placeholder="Enter coupon code" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={discount > 0 || isApplyingCoupon}
                                />
                                <Button type="button" onClick={handleApplyCoupon} disabled={!couponCode || discount > 0 || isApplyingCoupon}>
                                    {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                                </Button>
                            </div>
                            {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-6">Shipping & Payment</h2>
                 <Card>
                    <CardHeader>
                        <CardTitle>Checkout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {formError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{formError}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl><Input type="tel" placeholder="+91 98765 43210" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.address1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address Line 1</FormLabel>
                                                <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.address2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address Line 2 (Optional)</FormLabel>
                                                <FormControl><Input placeholder="Apt, suite, etc." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl><Input placeholder="New York" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State / Province</FormLabel>
                                                    <FormControl><Input placeholder="NY" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                     </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.zip"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ZIP / Postal Code</FormLabel>
                                                    <FormControl><Input placeholder="10001" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="India">India</SelectItem>
                                                            <SelectItem value="United States">United States</SelectItem>
                                                            <SelectItem value="Canada">Canada</SelectItem>
                                                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                      </div>
                                </div>
                                
                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                                    <div className="p-4 border rounded-md bg-muted text-muted-foreground text-sm">
                                        Payment provider integration (e.g. Stripe) would go here. For now, click below to simulate placing an order.
                                    </div>
                                </div>
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Place Order
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
