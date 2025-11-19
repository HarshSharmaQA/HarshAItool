
'use client';

import type { LeadershipBlock, MemberItem } from '@/lib/types';
import ImageWithFallback from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function LeadershipSection(props: LeadershipBlock) {
  const { title, subtitle, members } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!members || members.length === 0) return null;
  if (!isMounted) return null;

  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'Our Leadership'}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group h-full flex flex-col">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  {member.linkedinUrl && (
                     <div className="mt-auto pt-4">
                        <Button asChild variant="outline" size="icon" className="rounded-full">
                           <Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                           </Link>
                        </Button>
                     </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
