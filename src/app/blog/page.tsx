

import { getPosts, getBlogSettings } from '@/lib/data';
import type { Post } from '@/lib/types';
import BlogFilter from './blog-filter';

export const metadata = {
  title: 'Blog',
  description: 'Read the latest articles from our team.',
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const awaitedSearchParams = await searchParams;
  const blogSettings = await getBlogSettings();
  let allPosts = await getPosts('public');
  
  const initialCategory = typeof awaitedSearchParams?.category === 'string' ? awaitedSearchParams.category : 'All';

  if (blogSettings.listingType === 'manual' && blogSettings.manualOrder.length > 0) {
    const orderedPosts: Post[] = [];
    const postMap = new Map(allPosts.map(p => [p.id, p]));
    
    blogSettings.manualOrder.forEach(postId => {
      if (postMap.has(postId)) {
        orderedPosts.push(postMap.get(postId)!);
        postMap.delete(postId);
      }
    });

    allPosts = [...orderedPosts, ...Array.from(postMap.values())];
  }

  const allCategories = [...new Set(allPosts.flatMap(p => p.categories || []))];

  return (
    <div className="container mx-auto py-16 sm:py-24 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl">Our Blog</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Insights, articles, and news from our team.
        </p>
      </div>
      
      <BlogFilter 
        posts={allPosts}
        categories={allCategories}
        layout={blogSettings.layout}
        initialCategory={initialCategory}
      />
    </div>
  );
}
