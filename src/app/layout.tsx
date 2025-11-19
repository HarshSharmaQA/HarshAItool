
import type { Metadata, Viewport } from 'next';
import { getSettings } from '@/lib/data';
import { Playfair_Display, PT_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import GoogleSiteVerification from './google-site-verification';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ClientLayout from '@/components/layout/client-layout';
import { cn } from '@/lib/utils';
import { ClientProviders } from '@/components/providers/client-providers';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-headline',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const icons = settings.faviconUrl
    ? [{ rel: 'icon', url: settings.faviconUrl }]
    : [];

  return {
    title: {
      default: settings.siteTitle || 'Stratic CMS',
      template: `%s | ${settings.siteTitle || 'Stratic CMS'}`,
    },
    description: settings.siteDescription || 'A statically generated website using Next.js and Firebase.',
    icons,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    manifest: '/manifest.json',
    other: settings.customHeadContent ? { 'custom-head': settings.customHeadContent } : {},
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleSiteVerification />
      </head>
      <body className={cn(
          "font-body antialiased min-h-screen flex flex-col",
          playfairDisplay.variable,
          ptSans.variable,
          sourceCodePro.variable
        )} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme={settings.theme || "system"}
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders settings={settings}>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ClientProviders>
        </ThemeProvider>
        {settings.googleAnalyticsId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
