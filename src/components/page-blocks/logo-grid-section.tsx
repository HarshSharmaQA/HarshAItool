
'use client';
import ImageWithFallback from '@/components/image-with-fallback';
import type { LogoGridBlock, BlockSettings } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

interface LogoGridSectionProps extends LogoGridBlock {
    blockSettings: BlockSettings;
}

export default function LogoGridSection(props: LogoGridSectionProps) {
  const { title, subtitle, logos, view, scrollDirection, blockSettings } = props;
  const animationSpeed = blockSettings?.animationSpeed ?? 25;
  const useCarousel = view === 'carousel' && logos && logos.length > 0;

  const animationProps = {
    style: { animationDuration: `${animationSpeed}s` }
  };
  
  const a11yLogos = logos || [];
  const duplicatedLogos = useCarousel ? [...a11yLogos, ...a11yLogos, ...a11yLogos, ...a11yLogos] : [];

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'Our Partners'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'We are proud to work with these amazing companies.'}
          </p>
        </div>

        {a11yLogos && a11yLogos.length > 0 ? (
          useCarousel ? (
            <div
              className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
            >
              <ul 
                className={cn(
                  "flex items-center justify-center md:justify-start [&_li]:mx-8",
                  scrollDirection === 'right' ? 'animate-infinite-scroll-right' : 'animate-infinite-scroll'
                )}
                style={animationProps.style}
              >
                {duplicatedLogos.map((logo, index) => (
                  <li key={`${logo.id}-${index}`} className="flex-shrink-0">
                    <div className="relative w-36 h-20">
                      <ImageWithFallback
                        src={logo.url || 'https://picsum.photos/seed/placeholder/200/100'}
                        alt={logo.alt || 'Partner logo'}
                        fill
                        className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        unoptimized
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-8">
              {a11yLogos.map((logo, index) => (
                 <motion.div
                    key={logo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="w-40 h-28 flex items-center justify-center p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                        <div className="relative w-full h-full">
                            <ImageWithFallback
                                src={logo.url || 'https://picsum.photos/seed/placeholder/200/100'}
                                alt={logo.alt || 'Partner logo'}
                                fill
                                className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                unoptimized
                            />
                        </div>
                    </Card>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-muted-foreground">No logos have been added yet.</p>
        )}
      </div>
    </section>
  );
}
