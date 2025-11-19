
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { HeroBlock } from '@/lib/types';

export default function HeroSection(props: HeroBlock) {
  const { title, subtitle, ctaText, ctaLink } = props;

  return (
    <section className="relative bg-background">
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"></div>
      <div className="container relative mx-auto text-center py-24 sm:py-32">
        <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          {title || "Welcome to Our Website"}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          {subtitle || "Discover amazing things here. We are happy to have you."}
        </p>
        {ctaText && ctaLink && (
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
