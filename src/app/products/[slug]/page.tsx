

import { getProductBySlug, getSettings, getProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailsClient from './product-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageWithFallback from '@/components/image-with-fallback';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const products = await getProducts('published');
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product || product.status === 'draft') {
    return {};
  }
  
  const metadata: Metadata = {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.substring(0, 150),
    keywords: product.seoKeywords,
    alternates: {
      canonical: product.canonicalUrl,
    },
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description.substring(0, 150),
      images: [product.image.url],
    },
  };
  
  if (product.noIndex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  
  if (!product || product.status === 'draft') {
    notFound();
  }
  
  const settings = await getSettings();
  
  const allProducts = await getProducts('published');
  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  const currency = settings.currency || '₹';

  return (
    <div className="bg-background">
      <ProductDetailsClient product={product} settings={settings} />

      {relatedProducts.length > 0 && (
        <section className="py-20 sm:py-28 border-t bg-secondary/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline text-center mb-12">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {relatedProducts.map(relatedProduct => (
                        <Card key={relatedProduct.id} className="overflow-hidden group bg-background">
                            <Link href={`/products/${relatedProduct.slug}`} className="block">
                                <div className="aspect-square relative">
                                    <ImageWithFallback
                                        src={relatedProduct.image.url}
                                        alt={relatedProduct.name}
                                        fill
                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                        unoptimized
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">{relatedProduct.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-primary font-semibold text-lg">{currency}{relatedProduct.price.toFixed(2)}</p>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      )}
    </div>
  );
}
