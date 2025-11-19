
'use client';

import { useState } from 'react';
import type { Product, Settings } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SocialShareButtons from '@/components/social-share-buttons';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsClientProps {
    product: Product;
    settings: Settings;
}

export default function ProductDetailsClient({ product, settings }: ProductDetailsClientProps) {
    const currency = settings.currency || '₹';
    const { addItem } = useCart();
    const { toast } = useToast();
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} has been added to your cart.`,
        });
    };
    
    const incrementQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(q => q + 1);
        }
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    }

    return (
        <div className="container mx-auto py-16 sm:py-24 px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
              <div className="aspect-square relative rounded-lg overflow-hidden border shadow-lg bg-muted">
                <ImageWithFallback
                  src={product.image.url}
                  alt={product.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {product.isFeatured && <Badge>Featured</Badge>}
                        {product.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    <h1 className="text-3xl font-headline sm:text-4xl md:text-5xl">{product.name}</h1>
                </div>
                
                <p className="text-3xl font-semibold text-primary">
                  {product.price > 0 ? `${currency}${product.price.toFixed(2)}` : 'Free'}
                </p>

                <div className="text-sm text-muted-foreground space-y-2">
                    {product.sku && <p>SKU: {product.sku}</p>}
                    <p>
                      {product.stock > 10 ? (
                        <span className="text-green-600">In stock</span>
                      ) : product.stock > 0 ? (
                        <span className="text-orange-500">Low stock ({product.stock} remaining)</span>
                      ) : (
                        <span className="text-destructive">Out of stock</span>
                      )}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-4 border-t border-b">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                         <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= product.stock}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                  <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-grow">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
                
                <div className="pt-4">
                  <SocialShareButtons title={product.name} />
                </div>
              </div>
            </div>

            <div className="mt-16 pt-12 border-t">
              <h2 className="text-2xl font-bold font-headline mb-6">Product Description</h2>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
        </div>
    )
}
