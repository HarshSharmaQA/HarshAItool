
"use client";

import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import ClientOnly from './client-only';

interface SocialShareButtonsProps {
    title: string;
}

function ShareButtons({ title }: SocialShareButtonsProps) {
    const pathname = usePathname();
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
        setShareUrl(origin + pathname);
    }, [pathname]);

    if (!shareUrl) return null;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                    <Twitter className="h-4 w-4" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <Facebook className="h-4 w-4" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <Linkedin className="h-4 w-4" />
                </a>
            </Button>
        </div>
    )
}

export default function SocialShareButtons(props: SocialShareButtonsProps) {
    return (
        <ClientOnly>
            <ShareButtons {...props} />
        </ClientOnly>
    )
}
