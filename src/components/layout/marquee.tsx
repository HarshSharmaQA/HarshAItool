'use client';

import { MarqueeSettings } from "@/lib/types";
import Icon from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

export default function Marquee({ settings }: { settings: MarqueeSettings }) {
    // Add safety checks
    if (!settings || !settings.enabled || !Array.isArray(settings.items) || settings.items.length === 0) {
        return null;
    }

    const { items, speed = 25, direction = 'left' } = settings;

    // Filter out empty items
    const validItems = items.filter(item => item.text && item.text.trim() !== '');

    if (validItems.length === 0) {
        return null;
    }

    // Duplicate items for seamless scrolling
    const duplicatedItems = [...validItems, ...validItems];

    return (
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_128px,black_calc(100%-128px),transparent)] bg-primary text-primary-foreground h-10 items-center z-40 relative shadow-sm">
            <ul
                className={cn(
                    "marquee-content [&_li]:mx-4 md:[&_li]:mx-8 flex-nowrap",
                    direction === 'right' ? 'animate-infinite-scroll-right' : 'animate-infinite-scroll'
                )}
                style={{ animationDuration: `${speed}s` }}
            >
                {duplicatedItems.map((item, index) => (
                    <li key={`${item.id}-${index}`} className="marquee-item gap-2 flex-shrink-0 text-sm md:text-base">
                        {item.icon && item.icon.trim() !== '' && <Icon name={item.icon} className="h-4 w-4 text-current flex-shrink-0" />}
                        <span className="font-medium whitespace-nowrap">{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}