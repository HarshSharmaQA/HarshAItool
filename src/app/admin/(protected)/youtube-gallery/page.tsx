
import { getYouTubeVideos } from "@/lib/data";
import YouTubeGalleryClient from "./youtube-gallery-client";

export const metadata = {
  title: "YouTube Gallery",
};

export default async function YouTubeGalleryAdminPage() {
  const videos = await getYouTubeVideos();

  return <YouTubeGalleryClient initialVideos={videos} />;
}
