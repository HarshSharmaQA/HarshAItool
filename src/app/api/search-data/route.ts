
import { NextResponse } from 'next/server';
import { getPages, getPosts } from '@/lib/data';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const pages = await getPages('public');
    const posts = await getPosts('public');
    
    return NextResponse.json({ pages, posts });
  } catch (error) {
    console.error('Failed to fetch search data:', error);
    return NextResponse.json({ error: 'Failed to fetch search data' }, { status: 500 });
  }
}
