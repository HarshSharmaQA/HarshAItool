
'use client';

import { useUser } from '@/components/providers/app-providers';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Eye, Download, User, Home, Package, Truck, CheckCircle, XCircle, PackageSearch } from 'lucide-react';
import type { Order, Settings } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ImageWithFallback from '@/components/image-with-fallback';
import { generateInvoicePDF } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function OrderDetailsDialog({ order, isOpen, onOpenChange, settings }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; settings: Settings }) {
  const currency = settings?.currency || '₹';

  if (!order) return null;
  
  const getFormattedDate = (timestamp: any, includeTime = false) => {
    if (!timestamp) return 'N/A';
    let date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return includeTime ? format(date, "MMM d, yyyy, h:mm a") : format(date, "MMM d, yyyy");
  }

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending': return { variant: 'secondary' as const, icon: <Loader2 className="h-4 w-4 animate-spin" />, label: 'Pending' };
      case 'shipped': return { variant: 'default' as const, icon: <Truck className="h-4 w-4" />, label: 'Shipped' };
      case 'delivered': return { variant: 'outline' as const, icon: <CheckCircle className="h-4 w-4 text-green-600" />, label: 'Delivered' };
      case 'cancelled': return { variant: 'destructive' as const, icon: <XCircle className="h-4 w-4" />, label: 'Cancelled' };
      default: return { variant: 'secondary' as const, icon: <Package className="h-4 w-4" />, label: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Order #{order.id.slice(0, 7)}</DialogTitle>
              <DialogDescription>
                Placed on {getFormattedDate(order.createdAt, true)}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
                {statusInfo.icon}
                <span className="capitalize">{statusInfo.label}</span>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4"/> Customer Details</h3>
                    <div className="text-sm text-muted-foreground pl-6">
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.email}</p>
                        <p>{order.shippingAddress.phone}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Home className="h-4 w-4" /> Shipping Address</h3>
                    <div className="text-sm text-muted-foreground pl-6">
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>
                 {order.trackingNumber && (
                    <div className="md:col-span-2 space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Tracking Information</h3>
                        <div className="text-sm text-muted-foreground pl-6">
                            <p><strong>Provider:</strong> {order.shippingProvider || 'N/A'}</p>
                            <p><strong>Tracking #:</strong> {order.trackingNumber}</p>
                             {order.shippingProviderUrl && order.trackingNumber && (
                                <Button asChild size="sm" className="mt-2">
                                    <Link href={order.shippingProviderUrl.replace('{TRACKING_ID}', order.trackingNumber)} target="_blank" rel="noopener noreferrer">
                                        <PackageSearch className="mr-2 h-4 w-4" />
                                        Track Package
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Order Items</h3>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[64px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
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
                        <TableCell className="text-right">{currency}{(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t sm:justify-between items-center w-full">
          <Button variant="outline" onClick={() => generateInvoicePDF(order, settings)}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <div className="text-right">
              <p className="text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{currency}{order.total.toFixed(2)}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AccountClientPage({ settings }: { settings: Settings }) {
  const { user, userProfile, loading: userLoading } = useUser();
  const currency = settings.currency || '₹';
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const ordersQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user]);

  const { data: rawOrders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const orders = useMemo(() => {
    if (!rawOrders) return null;
    return [...rawOrders].sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : 0;
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : 0;
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
    });
  }, [rawOrders]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getFormattedDate = (timestamp: any) => {
      if (!timestamp) return 'N/A';
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, "MMM d, yyyy");
  }


  if (userLoading || (user && !userProfile)) {
    return (
        <div className="flex h-64 w-full flex-col items-center justify-center bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading account details...</p>
        </div>
    );
  }
  
  return (
    <>
      <div className="container mx-auto py-12 px-4 space-y-12">
          <header className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
                  <AvatarImage src={userProfile?.photoURL || undefined} />
                  <AvatarFallback>{getInitials(userProfile?.displayName || userProfile?.email)}</AvatarFallback>
              </Avatar>
              <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl">My Account</h1>
              <p className="mt-2 text-lg text-muted-foreground">{userProfile?.displayName || userProfile?.email}</p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                  <Card>
                      <CardHeader>
                          <CardTitle>Order History</CardTitle>
                          <CardDescription>A list of your recent orders.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                              <TableRow>
                                  <TableHead>Order ID</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                              </TableHeader>
                              <TableBody>
                              {ordersLoading ? (
                                  <TableRow>
                                  <TableCell colSpan={5} className="h-24 text-center">
                                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                  </TableCell>
                                  </TableRow>
                              ) : orders && orders.length > 0 ? (
                                  orders.map((order) => (
                                  <TableRow key={order.id}>
                                      <TableCell className="font-medium">
                                      <pre className="text-xs">#{order.id.slice(0, 7)}</pre>
                                      </TableCell>
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
                                          <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="mr-2 h-4 w-4" />View
                                            </Button>
                                             <Button variant="outline" size="sm" onClick={() => generateInvoicePDF(order, settings)}>
                                                <Download className="mr-2 h-4 w-4" /> PDF
                                            </Button>
                                          </div>
                                      </TableCell>
                                  </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                  <TableCell colSpan={5} className="h-24 text-center">
                                      No orders found.
                                  </TableCell>
                                  </TableRow>
                              )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>
              <div>
                   <Card>
                      <CardHeader>
                          <CardTitle>Profile Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                              <p className="font-semibold">{userProfile?.displayName}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p className="font-semibold">{userProfile?.email}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Role</p>
                              <p className="font-semibold capitalize">{userProfile?.role || 'User'}</p>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
        settings={settings}
      />
    </>
  );
}
