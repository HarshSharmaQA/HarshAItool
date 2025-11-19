

'use client';

import { useState } from 'react';
import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PostCardGrid from './post-card-grid';
import PostCardList from './post-card-list';
import { useRouter } from 'next/navigation';

interface BlogFilterProps {
  posts: Post[];
  categories: string[];
  layout: 'grid' | 'list';
  initialCategory?: string;
}

export default function BlogFilter({ posts, categories, layout, initialCategory = 'All' }: BlogFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const router = useRouter();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.categories?.includes(selectedCategory));

  const PostCardComponent = layout === 'list' ? PostCardList : PostCardGrid;
  
  // Find the featured post, or fall back to the first post if none is explicitly featured.
  const featuredPost = posts.find(p => p.isFeatured) || (posts.length > 0 ? posts[0] : null);
  
  // Create a list of posts that are *not* the featured post.
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id);

  // Determine if the currently selected category filter includes the featured post.
  const isFeaturedPostInFilter = featuredPost && (selectedCategory === 'All' || featuredPost.categories?.includes(selectedCategory));


  return (
    <div className="space-y-16">
        <div className="flex justify-center flex-wrap gap-2 mb-8">
            <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('All')}
            >
            All
            </Button>
            {categories.map(category => (
            <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(category)}
                className="capitalize"
            >
                {category}
            </Button>
            ))}
        </div>

        {posts.length === 0 ? (
            <p className="text-center text-muted-foreground mt-16">No posts yet. Check back soon!</p>
        ) : (
            <>
            {isFeaturedPostInFilter && featuredPost && selectedCategory === 'All' && (
                <section>
                    <PostCardList post={featuredPost} index={0} />
                </section>
            )}
            
            {filteredPosts.length === 0 ? (
                 <p className="text-center text-muted-foreground mt-16">No posts found in this category.</p>
            ) : (
                <section>
                  <div className={cn(
                      "grid gap-8",
                      layout === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                  )}>
                    {/* If a category is selected, show all matching posts */}
                    {selectedCategory !== 'All' ? (
                      filteredPosts.map((post, index) => (
                        <PostCardComponent key={post.id} post={post} index={index} />
                      ))
                    ) : (
                      /* Otherwise, show the non-featured posts */
                      regularPosts.map((post, index) => (
                        <PostCardComponent key={post.id} post={post} index={index + 1} />
                      ))
                    )}
                  </div>
                </section>
            )}
            </>
        )}
    </div>
  );
}
