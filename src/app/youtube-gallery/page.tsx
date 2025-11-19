
import { getYouTubeVideos } from '@/lib/data';
import VideoGalleryClient from './video-gallery-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Gallery',
  description: 'A collection of our latest videos from YouTube.',
};

export default async function YouTubeGalleryPage() {
  const videos = await getYouTubeVideos();

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl">
          Video Gallery
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Explore our collection of videos.
        </p>
      </header>
      <VideoGalleryClient initialVideos={videos} />
    </div>
  );
}
