
import ImageWithFallback from '@/components/image-with-fallback';
import type { GalleryBlock } from '@/lib/types';

export default function GallerySection(props: GalleryBlock) {
  const { title, subtitle, images } = props;

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'Our Gallery'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'A collection of our favorite moments.'}
          </p>
        </div>
        
        {images && images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg group">
                <ImageWithFallback
                    src={image.url || 'https://picsum.photos/seed/placeholder/400/400'}
                    alt={image.alt || 'Gallery image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                />
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">No images in this gallery yet.</p>
        )}

      </div>
    </section>
  );
}
