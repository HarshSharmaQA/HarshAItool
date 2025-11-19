
import ProductForm from '../../(form)/product-form';
import { getProduct } from '@/lib/data';
import { notFound } from 'next/navigation';
import { convertTimestamps } from '@/lib/utils';

export const metadata = {
  title: 'Edit Product',
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;
  const productData = await getProduct(awaitedParams.id);

  if (!productData) {
    notFound();
  }

  const product = convertTimestamps(productData);

  return <ProductForm product={product} />;
}
