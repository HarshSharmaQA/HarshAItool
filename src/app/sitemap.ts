
import { getPages, getPosts } from '@/lib/data';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Get all public pages
  const pages = await getPages('public');
  const pageEntries: MetadataRoute.Sitemap = pages
    .filter(page => page.urlSlug !== 'home') // Exclude the homepage slug
    .map(({ urlSlug, updatedAt }) => ({
    url: `${siteUrl}/${urlSlug}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
  }));

  // Get all public posts
  const posts = await getPosts('public');
  const postEntries: MetadataRoute.Sitemap = posts.map(({ urlSlug, updatedAt }) => ({
    url: `${siteUrl}/blog/${urlSlug}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
  }));

  // Combine with static routes
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ];

  return [
    ...staticEntries,
    ...pageEntries,
    ...postEntries,
  ];
}
