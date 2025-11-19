
'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export default function ImageWithFallback({ src, alt, fallbackSrc, ...props }: ImageWithFallbackProps) {
  const defaultFallback = PlaceHolderImages.find(p => p.id === 'blog-1')?.imageUrl || 'https://picsum.photos/seed/fallback/600/400';
  const [imgSrc, setImgSrc] = useState(src || defaultFallback);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setImgSrc(src || defaultFallback);
    setHasError(!src);
  }, [src, defaultFallback]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc || defaultFallback);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}
