import { getSettings } from '@/lib/data';
import { ClientProviders } from '@/components/providers/client-providers';
import CheckoutClientPage from './checkout-client';

export const metadata = {
    title: 'Checkout',
    description: 'Complete your purchase.',
};

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <div className="container mx-auto py-12 px-4">
       <header className="text-center mb-12">
        <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl">Checkout</h1>
      </header>
      <ClientProviders settings={settings}>
        <CheckoutClientPage settings={settings} />
      </ClientProviders>
    </div>
  );
}