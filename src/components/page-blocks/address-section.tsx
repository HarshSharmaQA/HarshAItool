
'use client';

import type { AddressBlock } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Twitter, Facebook, Linkedin, Globe } from 'lucide-react';
import XIcon from '../icons/x-icon';

export default function AddressSection(props: AddressBlock) {
  const { address, mapImageUrl, mapImageHint, socials } = props;

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border bg-card shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    {mapImageUrl && (
                        <div className="w-32 h-20 relative flex-shrink-0">
                             <ImageWithFallback
                                src={mapImageUrl}
                                alt={mapImageHint || 'Location Map'}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                    {address && (
                        <p className="text-lg font-medium text-muted-foreground whitespace-pre-line">{address}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {socials?.twitter && <Button asChild variant="outline" size="icon"><Link href={socials.twitter} target="_blank" rel="noopener noreferrer"><XIcon className="h-5 w-5" /></Link></Button>}
                    {socials?.facebook && <Button asChild variant="outline" size="icon"><Link href={socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></Link></Button>}
                    {socials?.linkedin && <Button asChild variant="outline" size="icon"><Link href={socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /></Link></Button>}
                    {socials?.website && <Button asChild variant="outline" size="icon"><Link href={socials.website} target="_blank" rel="noopener noreferrer"><Globe className="h-5 w-5" /></Link></Button>}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
