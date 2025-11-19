
'use client';

import type { Block } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BannerV2Block extends Block {
    title: string;
    ctaText: string;
    ctaLink: string;
    phoneImageUrl: string;
    phoneImageHint?: string;
}

export default function BannerV2Section(props: BannerV2Block) {
    const { title, ctaText, ctaLink, phoneImageUrl, phoneImageHint } = props;

  return (
    <section className="bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl border-t sm:border bg-card shadow-lg p-8 md:p-12 lg:p-16 overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent"></div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-center md:text-left flex flex-col items-center md:items-start justify-center">
                    <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl leading-tight max-w-lg">
                    {title || "What's the best way to enhance your photos?"}
                    </h1>
                    {ctaText && ctaLink && (
                    <div className="pt-2">
                        <Button asChild size="lg" className="backdrop-blur-sm bg-black/30 border-white/20 hover:bg-black/50 text-white">
                            <Link href={ctaLink}>{ctaText}</Link>
                        </Button>
                    </div>
                    )}
                </div>
                <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                        <svg viewBox="0 0 400 400" className="w-full h-auto text-primary/10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M363.5,186.5Q358,273,281.5,322Q205,371,123.5,335.5Q42,300,56.5,200Q71,100,140,56.5Q209,13,286,61.5Q363,110,363.5,186.5Z" />
                        </svg>
                    </div>
                    <div className="relative h-[450px] w-[225px] sm:h-[500px] sm:w-[250px] md:h-[550px] md:w-[275px]">
                    <ImageWithFallback
                        src={phoneImageUrl || 'https://raw.githubusercontent.com/bjcarlson42/portfoliogenerator/main/src/lib/assets/phone-mockup.png'}
                        alt={phoneImageHint || "App screenshot in phone"}
                        fill
                        className="object-contain drop-shadow-2xl"
                        unoptimized
                        data-ai-hint={phoneImageHint}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

