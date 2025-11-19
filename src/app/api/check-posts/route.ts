import { getPosts } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await getPosts('all');
    const postInfo = posts.map(post => ({
      id: post.id,
      title: post.title,
      urlSlug: post.urlSlug,
      status: post.status,
      publishedAt: post.publishedAt
    }));
    
    return NextResponse.json({
      message: 'Posts found',
      count: posts.length,
      posts: postInfo
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}