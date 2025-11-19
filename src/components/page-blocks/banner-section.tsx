
'use client';

import type { BannerBlock, BannerSlide, Settings } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '../icons/logo';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import XIcon from '../icons/x-icon';
import Image from 'next/image';
import { useRef } from 'react';

function Slide({ slide, block, settings }: { slide: BannerSlide, block: BannerBlock, settings: Settings | null }) {
    const darkBg = PlaceHolderImages.find(p => p.id === 'dark-hero-bg')?.imageUrl;
    const defaultImage = block.theme === 'dark' ? darkBg : 'https://picsum.photos/seed/banner/1920/1080';
    const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'logo')?.imageUrl;
    const logoSrc = settings?.siteLogoUrl || logoPlaceholder;
    
    return (
        <div className={cn(
            "relative w-full h-[90vh] min-h-[700px] flex items-center justify-center text-center p-4 overflow-hidden",
            block.theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'
        )}>
            <div className="absolute inset-0">
                <ImageWithFallback
                    src={slide.imageUrl || defaultImage!}
                    alt={slide.imageHint || slide.title || 'Banner image'}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                />
                 <div className={cn(
                    "absolute inset-0",
                    block.theme === 'dark' 
                        ? "bg-black/60"
                        : "bg-white/30"
                )} />
                <div className={cn(
                    "absolute inset-0",
                    block.theme === 'dark'
                        ? "bg-gradient-to-t from-black/50 via-transparent to-black/20"
                        : "bg-gradient-to-t from-white/30 to-transparent"
                )}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <div className={cn(
                  "p-3 rounded-full border shadow-lg backdrop-blur-sm mb-6 bg-background/10",
                   block.theme === 'dark' ? "border-white/10" : "border-black/10"
                )}>
                    <div className="p-2 rounded-full bg-background/20 animate-pulse w-14 h-14 flex items-center justify-center">
                        {logoSrc ? (
                            <Image 
                                src={logoSrc} 
                                alt={`${settings?.siteTitle || ''} logo`}
                                width={32}
                                height={32}
                                className="object-contain h-8 w-auto"
                                unoptimized
                            />
                        ) : (
                            <Logo className="h-8 w-8" />
                        )}
                    </div>
                </div>

                {block.preTitle && (
                    <div className={cn(
                      'flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-6',
                       block.theme === 'dark' ? 'opacity-80' : 'text-primary'
                    )}>
                        <span className='w-2 h-2 rounded-full bg-primary'></span>
                        <span>{block.preTitle}</span>
                    </div>
                )}
                
                <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                    {slide.title}
                </h1>
                <p className={cn(
                    "mt-6 text-lg max-w-3xl leading-relaxed",
                    block.theme === 'dark' ? 'text-white/80' : 'text-black/80'
                )}>
                    {slide.subtitle}
                </p>
                
                {slide.ctaText && slide.ctaLink && (
                    <div className="mt-12">
                        <Button asChild size="lg" variant={block.theme === 'dark' ? 'secondary' : 'default'} className={cn(
                           'text-lg py-7 px-8',
                           block.theme === 'dark' && "backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        )}>
                            <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                        </Button>
                    </div>
                )}
            </div>

            {block.showSocial && settings && (
                 <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-8">
                    {settings.socialTwitter && <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer"><XIcon className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity" /></a>}
                    {settings.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity" /></a>}
                    {settings.socialFacebook && <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity" /></a>}
                    {settings.socialLinkedin && <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity" /></a>}
                 </div>
            )}

            {block.showScroll && (
                <div className="absolute bottom-6 z-10 hidden md:flex flex-col items-center gap-2 animate-bounce-down opacity-50">
                    <div className="relative w-px h-6 bg-current">
                        <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-current rounded-full -translate-x-1/2"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface BannerSectionProps extends BannerBlock {
  settings: Settings | null;
}

export default function BannerSection(props: BannerSectionProps) {
  const { slides, automatic, settings } = props;
  
  const carouselPlugins = useRef(
    automatic ? [Autoplay({ delay: 5000, stopOnInteraction: true })] : []
  );

  if (!slides || slides.length === 0) {
    return null;
  }
  
  return (
      <Carousel 
          className="w-full"
          plugins={carouselPlugins.current}
          opts={{
              loop: slides.length > 1,
          }}
      >
          <CarouselContent>
              {slides.map((slide) => (
                  <CarouselItem key={slide.id}>
                      <Slide slide={slide} block={props} settings={settings} />
                  </CarouselItem>
              ))}
          </CarouselContent>
          {slides.length > 1 && (
              <>
                  <CarouselPrevious className={cn("absolute left-4 top-1/2 -translate-y-1/2 z-20", props.theme === 'dark' ? "text-white bg-black/20 border-white/10 hover:bg-black/40" : "text-black bg-white/30 border-black/10 hover:bg-white/50")} />
                  <CarouselNext className={cn("absolute right-4 top-1/2 -translate-y-1/2 z-20", props.theme === 'dark' ? "text-white bg-black/20 border-white/10 hover:bg-black/40" : "text-black bg-white/30 border-black/10 hover:bg-white/50")} />
              </>
          )}
      </Carousel>
  )
}
