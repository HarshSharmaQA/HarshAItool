import Image from 'next/image';
import { getPageBySlug, getSettings, getBlockSettings, getPages } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CTASection from '@/components/page-blocks/cta-section';
import SocialShareButtons from '@/components/social-share-buttons';
import ImageWithFallback from '@/components/image-with-fallback';
import LogoGridSection from '@/components/page-blocks/logo-grid-section';
import FounderNoteSection from '@/components/page-blocks/founder-note-section';
import DividerSection from '@/components/page-blocks/divider-section';
import TestimonialSection from '@/components/page-blocks/testimonial-section';
import GallerySection from '@/components/page-blocks/gallery-section';
import HeroSection from '@/components/page-blocks/hero-section';
import FeaturesSection from '@/components/page-blocks/features-section';
import RecentPostsSection from '@/components/page-blocks/recent-posts-section';
import HtmlSection from '@/components/page-blocks/html-section';
import ContactSection from '@/components/page-blocks/contact-section';
import BestAcfSection from '@/components/page-blocks/best-acf-section';
import BannerSection from '@/components/page-blocks/banner-section';
import ExpandingCardsSection from '@/components/page-blocks/expanding-cards-section';
import AddressSection from '@/components/page-blocks/address-section';
import MapSection from '@/components/page-blocks/map-section';
import NewsletterSection from '@/components/page-blocks/newsletter-section';
import LeadershipSection from '@/components/page-blocks/leadership-section';

type Props = {
  params: { slug: string };
};

const blockComponents: { [key: string]: React.ComponentType<any> } = {
  'logo-grid': LogoGridSection,
  'founder-note': FounderNoteSection,
  'divider': DividerSection,
  'cta': CTASection,
  'testimonial': TestimonialSection,
  'gallery': GallerySection,
  'hero': HeroSection,
  'features': FeaturesSection,
  'posts': RecentPostsSection,
  'html': HtmlSection,
  'contact': ContactSection,
  'best-acf': BestAcfSection,
  'banner': BannerSection,
  'expanding-cards': ExpandingCardsSection,
  'address': AddressSection,
  'community': () => null,
  'map': MapSection,
  'newsletter': NewsletterSection,
  'leadership': LeadershipSection,
};

export async function generateStaticParams() {
    const pages = await getPages('public');
    return pages.map((page) => ({
      slug: page.urlSlug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const page = await getPageBySlug(awaitedParams.slug);

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.content.substring(0, 150),
    keywords: page.seoKeywords,
    alternates: {
      canonical: page.canonicalUrl,
    },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.content.substring(0, 150),
      images: page.featuredImage ? [page.featuredImage.url] : [],
    },
    other: {}
  };

  if (page.noIndex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  if (page.customHeadContent && metadata.other) {
    metadata.other['custom-head'] = page.customHeadContent;
  }

  return metadata;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const awaitedParams = await params;
  const page = await getPageBySlug(awaitedParams.slug);

  if (!page || page.status === 'draft') {
    notFound();
  }
  
  const settings = await getSettings();
  const blockSettings = await getBlockSettings();

  if (page.urlSlug === 'home') {
    const { redirect } = await import('next/navigation');
    redirect('/');
  }

  const hasCTA = page.ctaTitle && page.ctaText && page.ctaLink;

  return (
    <>
      {page.customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: page.customSchema }}
        />
      )}
      {page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      )}
      <div className="bg-background">
        <header className="relative py-16 sm:py-24 bg-secondary/50 overflow-hidden">
          {page.featuredImage && page.featuredImage.url && (
            <div className="absolute inset-0">
              <ImageWithFallback
                  src={page.featuredImage.url}
                  alt={page.featuredImage.hint || page.title}
                  fill
                  className="object-cover"
                  data-ai-hint={page.featuredImage.hint}
                  priority
                  unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
            </div>
          )}
          <div className="container mx-auto px-4 text-center relative">
              <h1 className="font-headline text-center text-4xl sm:text-5xl md:text-6xl">{page.title}</h1>
          </div>
        </header>

        <div className="container mx-auto pb-16 sm:pb-24 px-4">
              <article className="prose dark:prose-invert max-w-4xl mx-auto lg:prose-xl font-body">
                  <div className="my-8 flex justify-center">
                    <SocialShareButtons title={page.title} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </article>
              
              {page.blocks && page.blocks.map((block) => {
                const BlockComponent = blockComponents[block.type];
                if (!BlockComponent) {
                    return <div key={block.id}>Unknown block type: {block.type}</div>;
                }
                 if (block.type === 'banner') {
                    return <BlockComponent key={block.id} {...block} settings={settings} />;
                }
                if (block.type === 'logo-grid') {
                    return <BlockComponent key={block.id} {...block} blockSettings={blockSettings} />;
                }
                return <BlockComponent key={block.id} {...block} />;
              })}

              {page.faqs && page.faqs.length > 0 && (
                <div className="max-w-4xl mx-auto mt-16">
                  <h2 className="text-3xl font-headline font-bold mb-8 text-center">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {page.faqs.map((faq, index) => (
                      <AccordionItem value={`item-${index}`} key={index} className="border-b">
                        <AccordionTrigger className="text-lg font-semibold text-left py-4 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-0 text-base text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
        </div>
        
        {hasCTA && (
          <CTASection 
            id="page-cta"
            type="cta"
            title={page.ctaTitle!}
            subtitle={page.ctaSubtitle!}
            ctaText={page.ctaText!}
            ctaLink={page.ctaLink!}
          />
        )}
      </div>
    </>
  );
}
