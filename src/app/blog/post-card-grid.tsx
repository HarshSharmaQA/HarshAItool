'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { FeaturedImage } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { format } from 'date-fns';
import { getPlaceholderImage, isFeaturedImage, createExcerpt } from '@/lib/utils';
import { memo } from 'react';

function PostCardGrid({ post, index }: { post: Post; index: number }) {
  const featuredImage = post.featuredImage?.url ? post.featuredImage : getPlaceholderImage(index);
  
  const imageUrl = isFeaturedImage(featuredImage) ? featuredImage.url : featuredImage.imageUrl;
  const imageHint = isFeaturedImage(featuredImage) ? featuredImage.hint : featuredImage.imageHint;
  
  const excerpt = post.seoDescription || createExcerpt(post.content);
  const publishedDate = new Date(post.publishedAt);

  return (
    <Card className="flex flex-col overflow-hidden group">
        <Link href={`/blog/${post.urlSlug}`} className="block overflow-hidden">
          <div className="aspect-video relative">
            <ImageWithFallback
              src={imageUrl}
              alt={imageHint || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={imageHint}
              unoptimized
            />
             {post.categories && post.categories.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {post.categories.slice(0, 2).map(category => (
                        <Badge key={category} variant="secondary" className="capitalize">{category}</Badge>
                    ))}
                </div>
            )}
          </div>
        </Link>
      
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          <Link href={`/blog/${post.urlSlug}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
          <Badge variant="outline">{post.author}</Badge>
          <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
          <time dateTime={publishedDate.toISOString()}>
            {format(publishedDate, 'MMMM d, yyyy')}
          </time>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-muted-foreground line-clamp-3 text-sm" dangerouslySetInnerHTML={{ __html: excerpt }} />
      </CardContent>
    </Card>
  );
}

export default memo(PostCardGrid);