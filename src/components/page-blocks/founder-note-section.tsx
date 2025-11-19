
'use client';

import type { FounderNoteBlock } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Linkedin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function FounderNoteSection(props: FounderNoteBlock) {
  const { preTitle, name, role, greeting, content, imageUrl, socials, imagePosition } = props;

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-4 relative">
        <div className="bg-background rounded-2xl shadow-lg p-8 md:p-12 lg:p-16 border">
            <div className={cn(
                "grid md:grid-cols-12 gap-12 lg:gap-16 items-center",
            )}>
            <div className={cn(
                "md:col-span-4 flex flex-col items-center text-center",
                imagePosition === 'right' && 'md:order-last'
            )}>
                {imageUrl && (
                <div className="w-48 h-48 lg:w-56 lg:h-56 relative mb-6">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-background shadow-lg bg-background">
                        <ImageWithFallback
                            src={imageUrl}
                            alt={name || 'Founder'}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
                )}
                <div className="space-y-1">
                    <p className="text-muted-foreground">{preTitle || 'A Note from'}</p>
                    <h3 className="text-3xl font-bold font-headline">{name || 'Founder Name'}</h3>
                    <div className="h-1 w-20 bg-primary mx-auto my-2"></div>
                    <p className="text-lg text-muted-foreground">{role || 'Founder & CEO'}</p>
                </div>
            </div>

            <div className={cn(
                "md:col-span-8 space-y-6 prose dark:prose-invert lg:prose-lg max-w-none"
            )}>
                <p className="text-2xl font-semibold">&ldquo;{greeting || 'Hey,'}&rdquo;</p>
                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: content || '' }} />
                {socials?.linkedin && (
                    <div className="flex items-center gap-4 not-prose pt-4">
                        <div className="w-10 h-px bg-muted-foreground"></div>
                        <span className="font-semibold text-foreground">{name}</span>
                        <Button asChild variant="outline" size="icon" className="rounded-full">
                            <Link href={socials.linkedin || '#'} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
            </div>
        </div>
      </div>
    </section>
  );
}
