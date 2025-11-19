
'use client';

import type { Block, FeatureItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Define the type for a Lucide icon component
type LucideIconType = React.ForwardRefExoticComponent<Omit<LucideIcons.LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = LucideIcons[name as IconName] as LucideIconType | undefined;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};

interface Member {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

interface CommunityBlock extends Block {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  members: Member[];
  features: FeatureItem[];
}

function TeamGallery({ members }: { members: Member[] }) {
  if (!members || members.length === 0) return null;
  const duplicatedMembers = [...members, ...members];

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll">
            {duplicatedMembers.map((member, index) => (
                <li key={`${member.id}-${index}`} className="flex-shrink-0">
                     <motion.div 
                        className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-background"
                        whileHover={{ scale: 1.1, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                     >
                        <Image src={member.imageUrl} alt={member.name} width={96} height={96} className="object-cover w-full h-full" unoptimized/>
                    </motion.div>
                </li>
            ))}
        </ul>
    </div>
  );
}

export default function CommunitySection(props: CommunityBlock) {
  const { title, subtitle, members = [], features = [], ctaText, ctaLink } = props;

  return (
    <section className="py-20 sm:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center">
            <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
                {title || 'Join a community of designers and developers'}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle || 'Our community is a place to connect, learn, and grow with fellow creators.'}
            </p>
        </div>

        <TeamGallery members={members} />

        <div className="flex justify-center">
            {ctaText && ctaLink && (
                <Button asChild size="lg">
                    <Link href={ctaLink}>{ctaText}</Link>
                </Button>
            )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(features || []).map((feature: FeatureItem) => (
            <Card key={feature.id} className="bg-secondary/30 border-border/20 hover:border-primary/20 hover:bg-background/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                        <Icon name={feature.icon} className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title || 'Feature Title'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description || 'Feature description goes here.'}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
