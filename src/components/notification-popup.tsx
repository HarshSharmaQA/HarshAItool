'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { NotificationPopupSettings } from '@/lib/types';
import Icon from '@/components/icons/Icon'; // Use the shared Icon component
import ImageWithFallback from './image-with-fallback';

const SESSION_STORAGE_KEY = 'notificationPopupDismissed';
const LOCAL_STORAGE_KEY_PREFIX = 'notificationPopupDismissed_';

export default function NotificationPopup({ settings }: { settings: NotificationPopupSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && settings.enabled) {
      const duration = settings.dismissalDuration || 'session';
      let dismissed = false;

      if (duration === 'session') {
        dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
      } else {
        const key = `${LOCAL_STORAGE_KEY_PREFIX}${duration}`;
        const dismissedTimestamp = localStorage.getItem(key);
        if (dismissedTimestamp) {
          const now = new Date().getTime();
          if (now < parseInt(dismissedTimestamp, 10)) {
            dismissed = true;
          } else {
            localStorage.removeItem(key); // Clean up expired entry
          }
        }
      }

      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, (settings.delaySeconds || 2) * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [settings, isMounted]);

  const handleDismiss = () => {
    const duration = settings.dismissalDuration || 'session';
    if (duration === 'session') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } else {
      const now = new Date().getTime();
      let expiryTime;
      if (duration === 'day') {
        expiryTime = now + 24 * 60 * 60 * 1000;
      } else { // week
        expiryTime = now + 7 * 24 * 60 * 60 * 1000;
      }
      const key = `${LOCAL_STORAGE_KEY_PREFIX}${duration}`;
      localStorage.setItem(key, expiryTime.toString());
    }
    setIsOpen(false);
  };

  if (!isMounted || !settings.enabled || !isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <AlertDialogContent className="max-w-sm md:max-w-md lg:max-w-lg w-full">
        {settings.imageUrl && (
            <div className="relative aspect-video -mt-6 -mx-6 rounded-t-lg overflow-hidden">
                <ImageWithFallback
                    src={settings.imageUrl}
                    alt={settings.imageHint || settings.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
        )}
        <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-2">
                {settings.icon && (
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                       <Icon name={settings.icon} className="h-5 w-5" />
                    </div>
                )}
                <AlertDialogTitle>{settings.title || 'Notification'}</AlertDialogTitle>
            </div>
          <AlertDialogDescription>
            {settings.message || ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>Close</AlertDialogCancel>
          {settings.ctaText && settings.ctaLink && (
            <AlertDialogAction asChild>
              <Link href={settings.ctaLink} onClick={handleDismiss}>
                {settings.ctaText}
              </Link>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}