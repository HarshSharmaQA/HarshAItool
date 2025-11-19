
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WhatsappSettings } from '@/lib/types';
import { MessageCircle } from 'lucide-react';

interface WhatsappButtonProps {
    settings: WhatsappSettings;
}

export default function WhatsappButton({ settings }: WhatsappButtonProps) {
  if (!settings?.enabled || !settings.phoneNumber) {
    return null;
  }

  const { phoneNumber, topics } = settings;

  return (
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-black hover:bg-gray-800 shadow-lg animate-pulse-whatsapp"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="h-8 w-8 text-white" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mb-2" side="top" align="end">
            {topics.map((topic, index) => (
                 <DropdownMenuItem key={index} asChild>
                     <Link
                        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(topic)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        {topic}
                     </Link>
                 </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
