
'use client';
import type { TestimonialBlock } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import ClientOnly from '../client-only';
import { useRef } from 'react';

function TestimonialCard({ name, company, quote }: { name: string, company: string, quote: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <Card className="h-full border-border/30 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
        <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
        </div>
        <blockquote className="text-lg font-medium leading-relaxed mb-6 flex-grow">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="flex items-center gap-4">
            <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TestimonialSection(props: TestimonialBlock) {
  const { title, subtitle, testimonials, view } = props;

  const useCarousel = view === 'carousel';

  const carouselPlugins = useRef(
    useCarousel ? [Autoplay({ delay: 5000, stopOnInteraction: true })] : []
  );

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'What Our Customers Say'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {subtitle || 'Hear from satisfied clients who have experienced our service firsthand.'}
          </p>
        </div>
        
        {useCarousel ? (
          <ClientOnly>
            <Carousel
              opts={{
                align: "start",
                loop: testimonials.length > 1,
              }}
              plugins={carouselPlugins.current}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <TestimonialCard 
                        name={testimonial.name || 'Anonymous'} 
                        company={testimonial.company || 'Company Inc.'} 
                        quote={testimonial.quote || 'This is a fantastic service. Highly recommended!'} 
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </ClientOnly>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <TestimonialCard 
                key={testimonial.id}
                name={testimonial.name || 'Anonymous'} 
                company={testimonial.company || 'Company Inc.'} 
                quote={testimonial.quote || 'This is a fantastic service. Highly recommended!'} 
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
