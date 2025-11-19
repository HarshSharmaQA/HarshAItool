
'use client';

import { useState, useMemo } from 'react';
import type { YouTubeVideo } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Video, FileWarning } from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import VideoCard from './video-card';
import AddVideoForm from './(form)/add-video-form';

export default function YouTubeGalleryClient({ initialVideos }: { initialVideos: YouTubeVideo[] }) {
    const [videos, setVideos] = useState(initialVideos);
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
    
    const handleVideoAdded = (newVideo: YouTubeVideo) => {
        setVideos(prev => [newVideo, ...prev]);
    };

    const handleVideoDeleted = (id: string) => {
        setVideos(prev => prev.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-8">
            <AddVideoForm onVideoAdded={handleVideoAdded} />

            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map(video => (
                        <VideoCard 
                            key={video.id}
                            video={video} 
                            onDeleted={handleVideoDeleted}
                            onView={() => setSelectedVideo(video)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Videos Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        There are no videos that match your current filters.
                    </p>
                </div>
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
        </div>
    );
}
