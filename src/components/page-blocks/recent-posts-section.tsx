import type { PostsBlock, Post } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { FeaturedImage } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import ImageWithFallback from '@/components/image-with-fallback';
import { getPlaceholderImage, isFeaturedImage, createExcerpt } from '@/lib/utils';

interface RecentPostsSectionProps extends PostsBlock {
    posts: Post[];
}

export default function RecentPostsSection(props: RecentPostsSectionProps) {
  const { title, subtitle, posts } = props;



  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'From Our Blog'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'Check out our latest articles and insights.'}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet. Check back soon!</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const featuredImage = post.featuredImage?.url ? post.featuredImage : getPlaceholderImage(index);
              const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
              const excerpt = (post.seoDescription || createExcerpt(post.content || ''));
              
              const imageUrl = isFeaturedImage(featuredImage) ? featuredImage.url : featuredImage.imageUrl;
              const imageHint = isFeaturedImage(featuredImage) ? featuredImage.hint : featuredImage.imageHint;
              
              return (
                <Card key={post.id} className="flex flex-col overflow-hidden group">
                  {featuredImage && (
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
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href={`/blog/${post.urlSlug}`} className="hover:text-primary transition-colors">{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        <Badge variant="outline">{post.author}</Badge>
                    </div>
                    <time dateTime={publishedDate.toISOString()} className="text-sm text-muted-foreground">
                        {format(publishedDate, 'MMMM d, yyyy')}
                    </time>
                </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
        <div className="text-center mt-16">
            <Button asChild variant="default">
                <Link href="/blog">View All Posts</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}