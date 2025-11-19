'use client';

import Image from 'next/image';

export default function BackgroundImage() {
    return (
        <Image
            src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx0ZWNobm9sb2d5JTIwYWJzdHJhY3R8ZW58MHx8fHwxNzU5NzQ4Nzc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Abstract background image"
            fill
            className="object-cover opacity-20"
            unoptimized
            data-ai-hint="technology abstract"
        />
    );
}