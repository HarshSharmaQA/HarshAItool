import { ClientProviders } from '@/components/providers/client-providers';
import PdfGalleryClient from './pdf-gallery-client';
import type { Settings } from '@/lib/types'; // Added import for Settings type

// Create a default settings object
const defaultSettings: Settings = {
  siteTitle: 'Stratic CMS',
  siteDescription: 'A modern CMS built with Next.js and Firebase.',
  siteLogoUrl: '',
  currency: '₹',
};

export const metadata = {
    title: 'PDF Gallery',
    description: 'Browse, search, and download from our collection of PDF documents.',
};

export default function PdfGalleryPage() {

  return (
    <div className="container mx-auto py-12 px-4">
       <header className="text-center mb-12">
        <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl">PDF Gallery</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Browse, search, and download from our collection of PDF documents.
        </p>
      </header>
      <ClientProviders settings={defaultSettings}>
        <PdfGalleryClient />
      </ClientProviders>
    </div>
  );
}