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

function PostCardList({ post, index }: { post: Post; index: number }) {
  const featuredImage = post.featuredImage?.url ? post.featuredImage : getPlaceholderImage(index);
  
  const imageUrl = isFeaturedImage(featuredImage) ? featuredImage.url : featuredImage.imageUrl;
  const imageHint = isFeaturedImage(featuredImage) ? featuredImage.hint : featuredImage.imageHint;
  
  const excerpt = post.seoDescription || createExcerpt(post.content, 250);
  const publishedDate = new Date(post.publishedAt);

  return (
    <Card className="grid md:grid-cols-3 overflow-hidden group w-full">
      <div className="md:col-span-1 aspect-video md:aspect-auto relative">
        <Link href={`/blog/${post.urlSlug}`} className="block overflow-hidden h-full">
            <ImageWithFallback
              src={imageUrl}
              alt={imageHint || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={imageHint}
              unoptimized
            />
        </Link>
      </div>
      <div className="md:col-span-2 p-6 flex flex-col">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.categories.map(category => (
                <Badge key={category} variant="secondary" className="capitalize">{category}</Badge>
            ))}
          </div>
        )}
        <CardHeader className="p-0">
          <CardTitle className="font-headline text-2xl">
            <Link href={`/blog/${post.urlSlug}`} className="hover:text-primary transition-colors">{post.title}</Link>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
            <Badge variant="outline">{post.author}</Badge>
            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
            <time dateTime={publishedDate.toISOString()}>
              {format(publishedDate, 'MMMM d, yyyy')}
            </time>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4 flex-grow">
          <div className="text-muted-foreground line-clamp-3 text-sm" dangerouslySetInnerHTML={{ __html: excerpt }} />
        </CardContent>
      </div>
    </Card>
  )
}

export default memo(PostCardList);