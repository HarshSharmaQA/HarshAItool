

import { getHomePage, getPosts, getSettings, getBlockSettings } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';
import HeroSection from '@/components/page-blocks/hero-section';
import FeaturesSection from '@/components/page-blocks/features-section';
import CTASection from '@/components/page-blocks/cta-section';
import TestimonialSection from '@/components/page-blocks/testimonial-section';
import RecentPostsSection from '@/components/page-blocks/recent-posts-section';
import GallerySection from '@/components/page-blocks/gallery-section';
import HtmlSection from '@/components/page-blocks/html-section';
import DividerSection from '@/components/page-blocks/divider-section';
import ContactSection from '@/components/page-blocks/contact-section';
import LogoGridSection from '@/components/page-blocks/logo-grid-section';
import FounderNoteSection from '@/components/page-blocks/founder-note-section';
import BestAcfSection from '@/components/page-blocks/best-acf-section';
import type { PostsBlock, HomePage } from '@/lib/types';
import type { Metadata } from 'next';
import BannerSection from '@/components/page-blocks/banner-section';
import ExpandingCardsSection from '@/components/page-blocks/expanding-cards-section';
import JsonLd from '@/components/json-ld';
import AddressSection from '@/components/page-blocks/address-section';
import MapSection from '@/components/page-blocks/map-section';
import NewsletterSection from '@/components/page-blocks/newsletter-section';
import BannerV2Section from '@/components/page-blocks/banner-v2-section';
import LeadershipSection from '@/components/page-blocks/leadership-section';

const blockComponents: { [key: string]: React.ComponentType<any> } = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CTASection,
  testimonial: TestimonialSection,
  posts: RecentPostsSection,
  gallery: GallerySection,
  html: HtmlSection,
  divider: DividerSection,
  contact: ContactSection,
  'logo-grid': LogoGridSection,
  'founder-note': FounderNoteSection,
  'best-acf': BestAcfSection,
  banner: BannerSection,
  'expanding-cards': ExpandingCardsSection,
  address: AddressSection,
  community: () => null,
  map: MapSection,
  newsletter: NewsletterSection,
  'banner-v2': BannerV2Section,
  leadership: LeadershipSection,
};

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const homePage = await getHomePage();
  
    const title = homePage.seoTitle || settings.siteTitle;
    const description = homePage.seoDescription || settings.siteDescription;
    const url = process.env.NEXT_PUBLIC_SITE_URL || '';
  
    const metadata: Metadata = {
      title,
      description,
      alternates: {
        canonical: homePage.canonicalUrl || url,
      },
      openGraph: {
          title,
          description,
          url,
          siteName: settings.siteTitle,
      }
    };
    
    if (homePage.noIndex) {
        metadata.robots = {
            index: false,
            follow: true,
        };
    }

    return metadata;
  }

export default async function Home() {
  const homePage = await getHomePage();
  const settings = await getSettings();
  const blockSettings = await getBlockSettings();
  
  const postsBlock = homePage.blocks?.find(block => block.type === 'posts') as PostsBlock | undefined;
  
  let postsForBlock: Post[] = [];
  if (postsBlock) {
    if (postsBlock.selectionType === 'favorite') {
      postsForBlock = await getPosts('public', 3, true);
    } else {
      postsForBlock = await getPosts('public', 3);
    }
  }


  if (!homePage || !homePage.blocks || homePage.blocks.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Welcome to Stratic CMS!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">Your new statically-generated site is almost ready.</p>
            <Alert>
              <Rocket className="h-4 w-4" />
              <AlertTitle>Next Steps</AlertTitle>
              <AlertDescription>
                To get started, log in to the admin panel and navigate to the "Homepage" section to add and configure your content blocks.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ldSchema: { [key: string]: any } = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    name: homePage.seoTitle || settings.siteTitle,
    description: homePage.seoDescription || settings.siteDescription,
  };

  if (homePage.publisher) {
    ldSchema.publisher = {
        '@type': 'Organization',
        name: homePage.publisher,
        logo: {
            '@type': 'ImageObject',
            url: settings.siteLogoUrl,
        }
    };
  }

  if (homePage.author) {
    ldSchema.author = {
        '@type': 'Person',
        name: homePage.author,
    };
  }

  return (
    <div>
        <JsonLd type="WebSite" data={ldSchema} />
        {homePage.blocks.map((block) => {
            const BlockComponent = blockComponents[block.type];
            if (!BlockComponent) {
                return <div key={block.id}>Unknown block type: {block.type}</div>;
            }
            if (block.type === 'posts') {
                return <BlockComponent key={block.id} {...block} posts={postsForBlock} />;
            }
             if (block.type === 'banner') {
                return <BlockComponent key={block.id} {...block} settings={settings} />;
            }
            if (block.type === 'logo-grid') {
                return <BlockComponent key={block.id} {...block} blockSettings={blockSettings} />;
            }
            return <BlockComponent key={block.id} {...block} />;
        })}
    </div>
  );
}
