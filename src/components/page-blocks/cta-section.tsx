import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { CTABlock } from '@/lib/types';

export default function CTASection(props: CTABlock) {
  const { title, subtitle, ctaText, ctaLink } = props;

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center border-2 border-primary/20 rounded-2xl p-8 sm:p-12 lg:p-16 bg-card shadow-lg">
            <h2 className="text-3xl font-headline tracking-tight sm:text-4xl">
              {title || "Ready to Get Started?"}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              {subtitle || "Join us today and take the next step towards success. We are here to help you achieve your goals."}
            </p>
            {ctaText && ctaLink && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}