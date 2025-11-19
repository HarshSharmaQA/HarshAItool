
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ContactBlock } from '@/lib/types';
import { Mail } from 'lucide-react';

export default function ContactSection(props: ContactBlock) {
  const { title, subtitle, ctaText, ctaLink } = props;

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-4">
                <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline tracking-tight sm:text-4xl">
              {title || "Get In Touch"}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {subtitle || "We'd love to hear from you. Send us a message and we'll get back to you as soon as possible."}
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
