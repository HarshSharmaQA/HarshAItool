

import { getOrder, getSettings } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ImageWithFallback from '@/components/image-with-fallback';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageSearch } from 'lucide-react';

export const metadata = {
  title: 'Order Confirmation',
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const orderData = await getOrder(params.id);
  const settings = await getSettings();

  if (!orderData) {
    notFound();
  }

  const order = orderData;
  const currency = settings.currency || '₹';

  const getStatusVariant = (status: any) => {
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

  const getFormattedDate = (timestamp: any, includeTime = false) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return format(date, includeTime ? "MMM d, yyyy, h:mm a" : "MMM d, yyyy");
  }


  return (
    <div className="container mx-auto py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl">Thank You!</h1>
                <p className="mt-4 text-lg text-muted-foreground">Your order has been placed successfully.</p>
            </div>
            <Card>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                    <CardTitle className="text-2xl">Order #{order.id.slice(0, 7)}</CardTitle>
                    <CardDescription>
                        Placed on{' '}
                        {getFormattedDate(order.createdAt, true)}
                    </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} className="text-sm capitalize">{order.status}</Badge>
                </div>
                </CardHeader>
                <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Shipping to</h3>
                        <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.name} <br/>
                            {order.shippingAddress.address1}
                            {order.shippingAddress.address2 && <><br />{order.shippingAddress.address2}</>}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zip}
                            <br />
                            {order.shippingAddress.country}
                        </p>
                    </div>
                    {order.trackingNumber && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tracking Information</h3>
                            <p className="text-sm text-muted-foreground">
                                <strong>Provider:</strong> {order.shippingProvider || 'N/A'}<br />
                                <strong>Tracking #:</strong> {order.trackingNumber}
                            </p>
                             {order.shippingProviderUrl && order.trackingNumber && (
                                <Button asChild size="sm" className="mt-2">
                                    <Link href={order.shippingProviderUrl.replace('{TRACKING_ID}', order.trackingNumber)} target="_blank" rel="noopener noreferrer">
                                        <PackageSearch className="mr-2 h-4 w-4" />
                                        Track Package
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <Separator className="my-8" />

                <div>
                    <h3 className="font-semibold mb-4">Order Summary</h3>
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
                                <ImageWithFallback
                                src={item.image?.url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                                />
                            </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                            {item.price > 0 ? `${currency}${item.price.toFixed(2)}` : 'Free'}
                            </TableCell>
                            <TableCell className="text-right">
                            {item.price > 0 ? `${currency}${(item.price * item.quantity).toFixed(2)}` : 'Free'}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-6 flex justify-end">
                    <div className="text-right">
                        <p className="text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{order.total > 0 ? `${currency}${order.total.toFixed(2)}` : 'Free'}</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
