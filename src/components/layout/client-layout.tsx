'use client';

import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Marquee from '@/components/layout/marquee';
import WhatsappButton from '@/components/whatsapp-button';
import NotificationPopup from '@/components/notification-popup';
import { useUser } from '../providers/app-providers';
import ClientOnly from '../client-only';
import { CartProvider } from '@/hooks/use-cart';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({
  children,
}: ClientLayoutProps) {
  const { settings } = useUser();

  if (!settings) return null;

  return (
      <CartProvider>
        {settings.marquee?.enabled && <Marquee settings={settings.marquee} />}
        <div className={settings.marquee?.enabled ? "pt-2.5" : ""}>
          {settings.headerMenu && <Header settings={settings} menu={settings.headerMenu} />}
        </div>
        <main className="flex-grow">
          {children}
        </main>
        {settings.footerMenu && <Footer settings={settings} menu={settings.footerMenu} />}
        <ClientOnly>
          {settings.whatsapp && <WhatsappButton settings={settings.whatsapp} />}
        </ClientOnly>
        <ClientOnly>
        {settings.notificationPopup && <NotificationPopup settings={settings.notificationPopup} />}
        </ClientOnly>
        <Toaster />
      </CartProvider>
  );
}