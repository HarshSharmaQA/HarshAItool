
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExpandingCardsBlock, ExpandingCardItem } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const cardVariants = {
  collapsed: {
    width: '8rem', // 128px
  },
  expanded: {
    width: '24rem', // 384px
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } },
};

function Card({
  card,
  isActive,
  onHover,
  onClick,
}: {
  card: ExpandingCardItem;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string | null) => void;
}) {
    const isMobile = useIsMobile();
  return (
    <motion.div
      variants={cardVariants}
      animate={isActive ? 'expanded' : 'collapsed'}
      transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
      onHoverStart={!isMobile ? () => onHover(card.id) : undefined}
      onClick={isMobile ? () => onClick(isActive ? null : card.id) : undefined}
      className="relative h-[32rem] rounded-2xl cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          src={card.imageUrl}
          alt={card.imageHint || card.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className={cn("absolute inset-0 p-6 flex", isActive ? "items-end" : "items-center")}>
        <h3
          className={cn(
            "text-2xl font-bold text-white transition-transform duration-300",
            !isActive && "transform -rotate-90"
          )}
        >
          {card.title}
        </h3>
        <AnimatePresence>
          {isActive && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute left-6 bottom-6 right-6"
            >
              <h3 className="text-3xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-white/80 mb-4">{card.description}</p>
              {card.detailsLink && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={card.detailsLink}>Details</Link>
                  </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ExpandingCardsSection(props: ExpandingCardsBlock) {
  const { title, subtitle, cards } = props;
  const isMobile = useIsMobile();
  const [activeCard, setActiveCard] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && cards && cards.length > 0) {
      setActiveCard(isMobile ? null : cards[0].id);
    }
  }, [isMobile, isMounted, cards]);

  const handleHover = (id: string | null) => {
    if (!isMobile) {
      setActiveCard(id);
    }
  };
  
  if (!isMounted) {
    return null; 
  }

  if (!cards || cards.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 sm:py-28 bg-background" onMouseLeave={!isMobile && cards.length > 0 ? () => handleHover(cards[0].id) : undefined}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isActive={activeCard === card.id}
              onHover={handleHover}
              onClick={setActiveCard}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
            {cards.map((card) => (
                <button
                    key={card.id}
                    onClick={() => setActiveCard(card.id)}
                    className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        activeCard === card.id ? "bg-primary" : "bg-muted"
                    )}
                    aria-label={`Show card ${card.title}`}
                />
            ))}
        </div>
      </div>
    </section>
  );
}
