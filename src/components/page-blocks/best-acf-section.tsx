
import type { BestAcfBlock } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { cn } from '@/lib/utils';

export default function BestAcfSection(props: BestAcfBlock) {
  const { title, subtitle, content, imageUrl, imagePosition } = props;

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'Advanced Content'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'A flexible content section.'}
          </p>
        </div>
        <div className={cn(
          "grid md:grid-cols-2 gap-12 items-center",
          imagePosition === 'left' ? 'md:grid-flow-row-dense' : ''
        )}>
          <div className={cn(
            "prose dark:prose-invert max-w-none lg:prose-lg",
            imagePosition === 'left' ? 'md:col-start-2' : ''
          )} dangerouslySetInnerHTML={{ __html: content || '' }} />
          {imageUrl && (
            <div className={cn(
              "aspect-video relative rounded-lg overflow-hidden",
              imagePosition === 'left' ? 'md:col-start-1' : ''
            )}>
              <ImageWithFallback
                src={imageUrl}
                alt={title || 'ACF Block Image'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
