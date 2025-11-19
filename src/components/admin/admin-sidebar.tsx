'use client';

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../icons/logo';
import { cn } from '@/lib/utils';
import ClientOnly from '../client-only';
import type { MenuItem } from '@/lib/types';
import Icon from '../icons/Icon';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function AdminSidebar({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();

  const isParentActive = (item: MenuItem) => {
    if (!item.links) return false;
    return item.links.some(subItem => subItem.path && pathname.startsWith(subItem.path));
  }

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-background border-r">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-foreground font-bold text-lg">Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {menuItems.map((item, index) => {
              const isActive = item.path && pathname.startsWith(item.path);

              if (item.isGroup && item.links && item.links.length > 0) {
                return (
                  <React.Fragment key={item.id}>
                    {(index > 0) && <Separator className="my-2" />}
                    <div className="px-3 py-2">
                      <h2 className="mb-2 text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                        <Icon name={item.icon!} className="h-5 w-5" />
                        <span>{item.label}</span>
                      </h2>
                      <div className="space-y-1">
                        {item.links.map(subItem => {
                            const isSubItemActive = subItem.path && pathname.startsWith(subItem.path);
                            return (
                               <Link
                                key={subItem.id}
                                href={subItem.path || '#'}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                                  isSubItemActive && "bg-accent text-primary"
                                )}
                              >
                                <Icon name={subItem.icon!} className="h-4 w-4" />
                                <span>{subItem.label}</span>
                              </Link>
                            )
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                );
              }
              
              if (!item.isGroup) {
                  return (
                    <Link
                      key={item.id}
                      href={item.path || '#'}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                        isActive && "bg-accent text-primary"
                      )}
                    >
                      <Icon name={item.icon!} className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
              }
              
              return null;

            })}
        </nav>
      </div>
    </div>
  );
}