
'use client';

import type { Block } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MapBlock extends Block {
    title: string;
    address: string;
    mapEmbedUrl: string;
    layout?: 'side-by-side' | 'stacked';
    phone?: string;
    email?: string;
    ctaText?: string;
    ctaLink?: string;
}

export default function MapSection(props: MapBlock) {
  const { title, address, mapEmbedUrl, layout = 'side-by-side', phone, email, ctaText, ctaLink } = props;

  const mapFrame = mapEmbedUrl ? (
    <div className="aspect-video w-full relative rounded-2xl overflow-hidden border shadow-lg">
      <iframe
        src={mapEmbedUrl}
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  ) : (
    <div className="aspect-video relative rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Map embed URL is not configured.</p>
    </div>
  );

  const detailsContent = (
      <div className={cn("flex flex-col justify-center h-full", layout === 'stacked' ? 'text-center items-center' : '')}>
        <h2 className="text-3xl font-headline sm:text-4xl">
          {title || 'Our Location'}
        </h2>
        
        <Card className="mt-8 bg-secondary/50 border-0 text-left w-full max-w-md">
            <CardContent className="p-6 space-y-6">
                {address && (
                    <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground p-3 rounded-full mt-1">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Address</h3>
                            <p className="text-muted-foreground whitespace-pre-line">{address}</p>
                        </div>
                    </div>
                )}
                {email && (
                    <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground p-3 rounded-full mt-1">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Email</h3>
                            <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary">{email}</a>
                        </div>
                    </div>
                )}
                {phone && (
                    <div className="flex items-start gap-4">
                         <div className="bg-primary text-primary-foreground p-3 rounded-full mt-1">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Phone</h3>
                            <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary">{phone}</a>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {ctaText && ctaLink && (
            <div className="mt-8">
                <Button asChild size="lg">
                    <Link href={ctaLink}>{ctaText}</Link>
                </Button>
            </div>
        )}
      </div>
  );

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        {layout === 'stacked' ? (
            <div className="text-center">
                {detailsContent}
                <div className="mt-12 max-w-4xl mx-auto">
                    {mapFrame}
                </div>
            </div>
        ) : (
             <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div>{detailsContent}</div>
                <div>{mapFrame}</div>
            </div>
        )}
      </div>
    </section>
  );
}
