import { getPostBySlug, getPosts, getBlockSettings } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import SocialShareButtons from '@/components/social-share-buttons';
import JsonLd from '@/components/json-ld';
import { getSettings } from '@/lib/data';
import ImageWithFallback from '@/components/image-with-fallback';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import CTASection from '@/components/page-blocks/cta-section';
import HeroSection from '@/components/page-blocks/hero-section';
import FeaturesSection from '@/components/page-blocks/features-section';
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
import ExpandingCardsSection from '@/components/page-blocks/expanding-cards-section';
import BannerSection from '@/components/page-blocks/banner-section';
import AddressSection from '@/components/page-blocks/address-section';
import MapSection from '@/components/page-blocks/map-section';
import NewsletterSection from '@/components/page-blocks/newsletter-section';
import BannerV2Section from '@/components/page-blocks/banner-v2-section';
import LeadershipSection from '@/components/page-blocks/leadership-section';
import { format } from 'date-fns';
import { getPlaceholderImage, createExcerpt } from '@/lib/utils';

type Props = {
  params: { slug: string };
};

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
  'expanding-cards': ExpandingCardsSection,
  banner: BannerSection,
  address: AddressSection,
  community: () => null,
  map: MapSection,
  newsletter: NewsletterSection,
  'banner-v2': BannerV2Section,
  leadership: LeadershipSection,
};

export async function generateStaticParams() {
    const posts = await getPosts('public');
    return posts.map((post) => ({
      slug: post.urlSlug,
    }));
}


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const post = await getPostBySlug(awaitedParams.slug);
  const settings = await getSettings();

  if (!post) {
    return {};
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.content.substring(0, 150);
  const images = post.featuredImage ? [post.featuredImage.url] : [];
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.urlSlug}`;
  
  // Safely handle dates for metadata
  let publishedAt, updatedAt;
  try {
    publishedAt = post.publishedAt ? new Date(post.publishedAt) : new Date();
    if (isNaN(publishedAt.getTime())) {
      publishedAt = new Date();
    }
  } catch (e) {
    publishedAt = new Date();
  }
  
  try {
    updatedAt = post.updatedAt ? new Date(post.updatedAt) : new Date();
    if (isNaN(updatedAt.getTime())) {
      updatedAt = new Date();
    }
  } catch (e) {
    updatedAt = new Date();
  }

  const metadata: Metadata = {
    title,
    description,
    keywords: post.seoKeywords,
    alternates: {
      canonical: post.canonicalUrl || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteTitle,
      images,
      type: 'article',
      publishedTime: publishedAt.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    other: {}
  };

  if (post.noIndex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }
  
  if (post.customHeadContent && metadata.other) {
    metadata.other['custom-head'] = post.customHeadContent;
  }

  return metadata;
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await params;
  const post = await getPostBySlug(awaitedParams.slug);
  
  if (!post || post.status === 'draft') {
    notFound();
  }
  
  const settings = await getSettings();
  const blockSettings = await getBlockSettings();
  
  // Safely handle publishedAt date
  let publishedAt;
  try {
    publishedAt = post.publishedAt ? new Date(post.publishedAt) : new Date();
    if (isNaN(publishedAt.getTime())) {
      publishedAt = new Date();
    }
  } catch (e) {
    publishedAt = new Date();
  }

  let relatedPosts = [];
  if (post.showRelatedPosts) {
    const allPosts = await getPosts('public');
    if (post.relatedPostsSelection === 'manual' && post.manualRelatedPosts && post.manualRelatedPosts.length > 0) {
      relatedPosts = post.manualRelatedPosts
        .map(id => allPosts.find(p => p.id === id))
        .filter(p => p && p.id !== post.id) as any[];
    } else { // 'latest' or fallback to latest by category
      const currentPostCategories = post.categories || [];
      relatedPosts = allPosts
        .filter(p => 
            p.id !== post.id && 
            p.categories?.some(cat => currentPostCategories.includes(cat))
        )
        .slice(0, 3);
    }
  }



  const hasCTA = post.ctaTitle && post.ctaText && post.ctaLink;

    const postsForBlock = await (async () => {
    const postsBlock = post.blocks?.find(block => block.type === 'posts') as PostsBlock | undefined;
    if (postsBlock) {
        if (postsBlock.selectionType === 'favorite') {
        return await getPosts('public', 3, true);
        } else {
        return await getPosts('public', 3);
        }
    }
    return [];
    })();

  return (
    <>
      <JsonLd 
          type="Article"
          data={{
              '@context': 'https://schema.org',
              '@type': 'Article',
              mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.urlSlug}`,
              },
              headline: post.title,
              image: post.featuredImage ? [post.featuredImage.url] : [],
              datePublished: (() => {
                try {
                  const date = post.publishedAt ? new Date(post.publishedAt) : new Date();
                  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
                } catch (e) {
                  return new Date().toISOString();
                }
              })(),
              dateModified: (() => {
                try {
                  const date = post.updatedAt ? new Date(post.updatedAt) : new Date();
                  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
                } catch (e) {
                  return new Date().toISOString();
                }
              })(),
              author: {
                  '@type': 'Person',
                  name: post.author,
              },
              publisher: {
                  '@type': 'Organization',
                  name: settings.siteTitle,
                  logo: {
                      '@type': 'ImageObject',
                      url: settings.siteLogoUrl,
                  },
              },
              description: post.seoDescription || post.content.substring(0, 250),
          }}
      />
      {post.customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.customSchema }}
        />
      )}
      {post.customCss && (
          <style dangerouslySetInnerHTML={{ __html: post.customCss }} />
      )}
      <div className="bg-background">
          <header className="relative py-16 sm:py-24 bg-secondary/50 overflow-hidden">
            {post.featuredImage && (
              <div className="absolute inset-0">
                <ImageWithFallback
                    src={post.featuredImage.url}
                    alt={post.featuredImage.hint || post.title}
                    fill
                    className="object-cover"
                    data-ai-hint={post.featuredImage.hint}
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
              </div>
            )}
            <div className="container mx-auto px-4 text-center relative">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {post.categories?.map(category => (
                      <Badge key={category} variant="secondary" className="capitalize">
                          {category}
                      </Badge>
                  ))}
              </div>
              <h1 className="font-headline text-center text-4xl sm:text-5xl md:text-6xl">{post.title}</h1>
              <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">By {post.author}</Badge>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                    <time dateTime={publishedAt.toISOString()}>
                        {format(publishedAt, 'MMMM d, yyyy')}
                    </time>
              </div>
            </div>
          </header>

          <div className="container mx-auto pb-16 sm:pb-24 px-4">
                <article className="prose dark:prose-invert max-w-4xl mx-auto lg:prose-xl font-body">
                    <div className="my-8 flex justify-center">
                      <SocialShareButtons title={post.title} />
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                {post.blocks && post.blocks.map((block) => {
                  const BlockComponent = blockComponents[block.type];
                  if (!BlockComponent) {
                      return <div key={block.id}>Unknown block type: {block.type}</div>;
                  }
                   if (block.type === 'posts') {
                      return <BlockComponent key={block.id} {...block} posts={postsForBlock} />;
                  }
                   if (block.type === 'logo-grid') {
                      return <BlockComponent key={block.id} {...block} blockSettings={blockSettings} />;
                  }
                  if (block.type === 'banner') {
                      return <BlockComponent key={block.id} {...block} settings={settings} />;
                  }
                  return <BlockComponent key={block.id} {...block} />;
                })}
                
                {post.faqs && post.faqs.length > 0 && (
                  <div className="max-w-4xl mx-auto mt-16">
                    <h2 className="text-3xl font-headline font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {post.faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-secondary/30 px-6 mb-4">
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

              {relatedPosts.length > 0 && (
                  <div className="max-w-5xl mx-auto mt-16 pt-16 border-t">
                      <h2 className="text-3xl font-headline font-bold mb-8 text-center">Related Posts</h2>
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                          {relatedPosts.map((relatedPost, index) => {
                               const pImage = relatedPost.featuredImage?.url ? relatedPost.featuredImage : getPlaceholderImage(index);
                               const pExcerpt = (relatedPost.seoDescription || createExcerpt(relatedPost.content));
                               const pDate = new Date(relatedPost.publishedAt);
                              return (
                                  <Card key={relatedPost.id} className="flex flex-col overflow-hidden group">
                                       <Link href={`/blog/${relatedPost.urlSlug}`} className="block overflow-hidden">
                                          <div className="aspect-video relative">
                                              <ImageWithFallback
                                              src={pImage.url}
                                              alt={pImage.hint || relatedPost.title}
                                              fill
                                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                                              data-ai-hint={pImage.hint}
                                              unoptimized
                                              />
                                          </div>
                                      </Link>
                                      <CardHeader>
                                          <CardTitle className="font-headline text-xl">
                                          <Link href={`/blog/${relatedPost.urlSlug}`} className="hover:text-primary transition-colors">{relatedPost.title}</Link>
                                          </CardTitle>
                                      </CardHeader>
                                      <CardContent className="flex-grow">
                                          <p className="text-muted-foreground line-clamp-3">
                                          {pExcerpt}
                                          </p>
                                      </CardContent>
                                      <CardFooter className="flex justify-between items-center">
                                          <div className="text-sm text-muted-foreground">
                                              <Badge variant="outline">{relatedPost.author}</Badge>
                                          </div>
                                            <time dateTime={pDate.toISOString()} className="text-sm text-muted-foreground">
                                                {format(pDate, 'MMMM d, yyyy')}
                                            </time>
                                      </CardFooter>
                                  </Card>
                              )
                          })}
                      </div>
                  </div>
              )}
          </div>
          
          {hasCTA && (
            <CTASection 
              id="post-cta"
              type="cta"
              title={post.ctaTitle!}
              subtitle={post.ctaSubtitle!}
              ctaText={post.ctaText!}
              ctaLink={post.ctaLink!}
            />
          )}
      </div>
    </>
  );
}