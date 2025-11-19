
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageWithFallback from '@/components/image-with-fallback';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, currency } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        addItem(product, 1);
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
    };

    return (
        <Card
            key={product.id}
            className="flex flex-col overflow-hidden group"
        >
            <Link href={`/products/${product.slug}`} className="block overflow-hidden">
            <div className="aspect-square relative">
                <ImageWithFallback
                src={product.image.url}
                alt={product.image.hint || product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                unoptimized
                />
                 {product.tags && product.tags.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {product.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
                        ))}
                    </div>
                )}
            </div>
            </Link>

            <CardHeader>
            <CardTitle className="font-headline text-xl">
                <Link
                href={`/products/${product.slug}`}
                className="hover:text-primary transition-colors"
                >
                {product.name}
                </Link>
            </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-muted-foreground line-clamp-2 text-sm" dangerouslySetInnerHTML={{ __html: product.description }} />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
            <p className="text-lg font-semibold">
                {product.price > 0 ? `${currency}${product.price.toFixed(2)}` : 'Free'}
            </p>
            <Button onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            </CardFooter>
        </Card>
    )
}
