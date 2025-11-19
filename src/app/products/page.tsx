
import { getProducts, getSettings } from '@/lib/data';
import ProductCard from './product-card';

export const metadata = {
  title: 'Products',
  description: 'Browse our collection of products.',
};

export default async function ProductsPage() {
  const products = await getProducts('published');

  return (
      <div className="container mx-auto py-16 sm:py-24 px-4">
      <div className="text-center mb-12">
          <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl">
          Our Products
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Explore our collection of high-quality products.
          </p>
      </div>

      {products.length === 0 ? (
          <p className="text-center text-muted-foreground mt-16">
          No products available yet. Check back soon!
          </p>
      ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
              <ProductCard key={product.id} product={product} />
          ))}
          </div>
      )}
      </div>
  );
}
