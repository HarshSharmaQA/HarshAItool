
'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Eye, Trash2, PackageSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/app-providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ImageWithFallback from '@/components/image-with-fallback';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus, deleteOrder, updateOrderTracking } from '@/app/actions/order-actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as React from 'react';

const trackingFormSchema = z.object({
  trackingNumber: z.string().optional(),
  shippingProvider: z.string().optional(),
  shippingProviderUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: Order['status'] }) {
    const { user } = useUser();
    const { toast } = useToast();
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
  
    const handleStatusChange = async (newStatus: Order['status']) => {
      if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
      }
      setIsUpdating(true);
      try {
        const idToken = await user.getIdToken();
        const result = await updateOrderStatus(idToken, orderId, newStatus);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
          toast({ title: 'Success', description: result.success });
          setStatus(newStatus);
        }
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsUpdating(false);
      }
    };
  
    return (
        <div className="flex items-center gap-2">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
                <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
      </div>
    );
  }

function DeleteOrderButton({ orderId }: { orderId: string }) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        setIsDeleting(true);
        try {
            const idToken = await user.getIdToken();
            const result = await deleteOrder(idToken, orderId);
            if (result.error) {
                toast({ variant: "destructive", title: "Error", description: result.error });
            } else {
                toast({ title: "Success", description: result.success });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-9">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the order. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function OrderDetailsDialog({ order, isOpen, onOpenChange, settings }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; settings: any }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const currency = settings?.currency || '₹';

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      trackingNumber: order?.trackingNumber || '',
      shippingProvider: order?.shippingProvider || '',
      shippingProviderUrl: order?.shippingProviderUrl || '',
    }
  });

  React.useEffect(() => {
    if (order) {
      form.reset({
        trackingNumber: order.trackingNumber || '',
        shippingProvider: order.shippingProvider || '',
        shippingProviderUrl: order.shippingProviderUrl || '',
      });
    }
  }, [order, form]);
  
  if (!order) return null;

  const onTrackingSubmit = async (data: TrackingFormValues) => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
        return;
    }
    setIsUpdatingTracking(true);
    try {
        const idToken = await user.getIdToken();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        const result = await updateOrderTracking(idToken, order.id, formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.success });
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
        setIsUpdatingTracking(false);
    }
  };

  const getFormattedDate = (timestamp: any, includeTime = false) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return format(date, includeTime ? "MMM d, yyyy, h:mm a" : "MMM d, yyyy");
  }

  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-2xl">Order #{order.id.slice(0, 7)}</DialogTitle>
                        <DialogDescription>
                            Placed on{' '}{getFormattedDate(order.createdAt, true)}
                        </DialogDescription>
                    </div>
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </DialogHeader>
            <div className="space-y-8 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Customer Details</h3>
                        <p className="text-sm text-muted-foreground">{order.shippingAddress.name}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Shipping Address</h3>
                        <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.address1}
                            <br />
                            {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}{order.shippingAddress.zip}
                            <br />
                            {order.shippingAddress.country}
                        </p>
                    </div>
                </div>

                 <Separator />

                <div>
                    <h3 className="font-semibold mb-4">Tracking Information</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onTrackingSubmit)} className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                                <FormItem><FormLabel>Tracking Number</FormLabel><FormControl><Input placeholder="e.g., 1Z9999999999999999" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="shippingProvider" render={({ field }) => (
                                <FormItem><FormLabel>Shipping Provider</FormLabel><FormControl><Input placeholder="e.g., UPS" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                            )} />
                           </div>
                             <FormField control={form.control} name="shippingProviderUrl" render={({ field }) => (
                                <FormItem><FormLabel>Tracking URL</FormLabel><FormControl><Input placeholder="e.g., https://www.ups.com/track?tracknum={TRACKING_ID}" {...field} value={field.value || ''}/></FormControl><FormDescription>Use {'{TRACKING_ID}'} as a placeholder for the tracking number.</FormDescription><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" size="sm" disabled={isUpdatingTracking}>
                                {isUpdatingTracking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageSearch className="mr-2 h-4 w-4" />}
                                Save Tracking
                            </Button>
                        </form>
                    </Form>
                </div>


                <Separator />

                <div>
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                            <div className="w-16 h-16 bg-muted rounded-md relative overflow-hidden">
                                <ImageWithFallback src={item.image?.url} alt={item.name} fill className="object-cover" unoptimized/>
                            </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">{currency}{item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{currency}{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                 <Separator />
                <div className="flex justify-end">
                    <div className="text-right">
                        <p className="text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{currency}{order.total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </DialogContent>
      </Dialog>
  )
}

export default function OrdersAdminPage() {
  const ordersQuery = db
    ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    : null;
  const { data: orders, loading } = useCollection<Order>(ordersQuery);
  const { settings } = useUser();
  const currency = settings?.currency || '₹';
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return format(date, "MMM d, yyyy");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>A list of all customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <pre className="text-xs">#{order.id.slice(0, 7)}</pre>
                    </TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>
                      {getFormattedDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{currency}{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Button>
                            <DeleteOrderButton orderId={order.id} />
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
        settings={settings}
      />
    </>
  );
}

    

    
