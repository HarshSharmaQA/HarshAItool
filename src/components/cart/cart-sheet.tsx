
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

export default function CartSheet() {
  const { cartItems, removeItem, updateItemQuantity, cartCount, cartTotal, currency } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4 text-current" />
          {cartCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center p-0"
            >
              {cartCount}
            </Badge>
          )}
          <span className="sr-only">Open shopping cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {cartItems.length > 0 ? (
            <ScrollArea className="h-full pr-6">
              <div className="flex flex-col gap-6 py-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image.url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h3>
                            <Link href={`/products/${item.slug}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">{item.price > 0 ? `${currency}${(item.price * item.quantity).toFixed(2)}` : 'Free'}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 rounded-md border border-input bg-transparent px-2 py-1"
                        />
                        <div className="flex">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-current"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground text-current" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <SheetFooter className="px-6 py-4 border-t bg-background">
            <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <p>Subtotal</p>
                  <p>{cartTotal > 0 ? `${currency}${cartTotal.toFixed(2)}` : 'Free'}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <SheetClose asChild>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/checkout">Checkout</Link>
                    </Button>
                </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
