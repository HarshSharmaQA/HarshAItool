
'use client';

import { useState, useMemo } from 'react';
import type { YouTubeVideo } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Video } from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export default function VideoGalleryClient({ initialVideos }: { initialVideos: YouTubeVideo[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredVideos = useMemo(() => {
        if (!initialVideos) return [];
        return initialVideos.filter(video =>
            video.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            video.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [initialVideos, debouncedSearchTerm]);

    return (
        <>
            <div className="mb-8">
                <Input
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm mx-auto"
                />
            </div>

            {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map(video => (
                        <div
                            key={video.id}
                            className="group cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                    alt={video.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Video className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mt-4">{video.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No videos found.</p>
            )}

            <Dialog open={!!selectedVideo} onOpenChange={(isOpen) => !isOpen && setSelectedVideo(null)}>
                <DialogContent className="max-w-4xl p-0">
                    {selectedVideo && (
                        <>
                            <div className="aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <DialogHeader className="p-6">
                                <DialogTitle>{selectedVideo.title}</DialogTitle>
                                <DialogDescription>{selectedVideo.description}</DialogDescription>
                            </DialogHeader>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
