export interface FAQ {
    id?: string;
    question: string;
    answer: string;
}

export interface FeaturedImage {
    url: string;
    hint: string;
}

export interface PDF {
    id: string;
    title: string;
    fileUrl: string;
    description?: string;
    uploadDate: any;
    uploader: string;
    category?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface YouTubeVideo {
    id: string;
    videoId: string;
    title: string;
    description?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  urlSlug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  status: 'draft' | 'public';
  customCss?: string;
  customHeadContent?: string;
  customSchema?: string;
  faqs?: FAQ[];
  featuredImage?: FeaturedImage;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaOpenInNewTab?: boolean;
  blocks?: Array<Block>;
  createdAt?: any;
  updatedAt?: any;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  urlSlug: string;
  author: string;
  publishedAt?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  categories?: string[];
  featuredImage?: FeaturedImage;
  status: 'draft' | 'public' | 'scheduled';
  isFavorite?: boolean;
  isFeatured?: boolean;
  customCss?: string;
  customHeadContent?: string;
  customSchema?: string;
  faqs?: FAQ[];
  showRelatedPosts?: boolean;
  relatedPostsSelection?: 'latest' | 'manual';
  manualRelatedPosts?: string[];
  createdAt?: any;
  updatedAt?: any;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaOpenInNewTab?: boolean;
  blocks?: Array<Block>;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sku?: string;
    status: 'draft' | 'published';
    slug: string;
    image: { url: string; hint?: string };
    isFeatured?: boolean;
    category?: string;
    tags?: string[];
    createdAt: any;
    updatedAt: any;
    stock: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
}

export interface Order {
    id: string;
    userId?: string;
    email: string;
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        image: {
            url: string;
            hint?: string;
        };
        size?: string;
        color?: string;
    }[];
    total: number;
    shippingAddress: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone?: string;
    };
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    shippingProvider?: string;
    shippingProviderUrl?: string;
    couponCode?: string;
    discount?: number;
    createdAt: any;
    updatedAt?: any;
}

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  description?: string;
  order: number;
  isGroup?: boolean;
  links?: MenuItem[];
  external?: boolean;
  icon?: string;
  exact?: boolean;
}

export interface Menu {
  id: 'header' | 'footer';
  title?: string;
  links: MenuItem[];
}

export interface Settings {
  siteTitle: string;
  siteDescription: string;
  siteLogoUrl: string;
  faviconUrl?: string;
  googleAnalyticsId?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  customHeadContent?: string;
  copyrightText?: string;
  theme?: 'light' | 'dark' | 'system' | 'dramatic';
  currency?: string;
  headerMenu?: Menu;
  footerMenu?: Menu;
  whatsapp?: WhatsappSettings;
  notificationPopup?: NotificationPopupSettings;
  marquee?: MarqueeSettings;
}

export interface ContactSettings {
    email: string;
    phone: string;
    address: string;
}

export interface WhatsappSettings {
    enabled: boolean;
    phoneNumber: string;
    topics: string[];
}

export interface MarqueeItem {
    id: string;
    text: string;
    icon?: string;
}

export interface MarqueeSettings {
    enabled: boolean;
    speed: number;
    items: MarqueeItem[];
    direction?: 'left' | 'right';
}

export interface NotificationPopupSettings {
    enabled: boolean;
    title: string;
    message: string;
    ctaText: string;
    ctaLink: string;
    delaySeconds?: number;
    dismissalDuration?: 'session' | 'day' | 'week';
    icon?: string;
    imageUrl?: string;
    imageHint?: string;
}

export interface EmailTemplate {
    id: 'contact-form' | 'new-subscriber' | 'new-post';
    title: string;
    description: string;
    subject: string;
    body: string;
    placeholders: string[];
}


export interface UserProfile {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: 'admin' | 'user';
  approved?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  approved: boolean;
}

// Block Types for Homepage
export type BlockType = 'hero' | 'features' | 'cta' | 'testimonial' | 'posts' | 'gallery' | 'html' | 'divider' | 'expanding-cards' | 'contact' | 'logo-grid' | 'founder-note' | 'best-acf' | 'banner' | 'address' | 'community' | 'map' | 'newsletter' | 'banner-v2' | 'leadership';

export interface Block {
    id: string;
    type: BlockType;
    [key: string]: any;
}

export interface HeroBlock extends Block {
    type: 'hero';
    title: string;
    subtitle: string;
    preTitle?: string;
    ctaText: string;
    ctaLink: string;
    theme?: 'light' | 'dark';
    showScroll?: boolean;
    scrollToSection?: string;
}

export interface BannerSlide {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageHint?: string;
    ctaText?: string;
    ctaLink?: string;
}

export interface BannerBlock extends Block {
    type: 'banner';
    automatic: boolean;
    slides: BannerSlide[];
    preTitle?: string;
    theme?: 'light' | 'dark';
    showScroll?: boolean;
    showSocial?: boolean;
}

export interface BannerV2Block extends Block {
  type: 'banner-v2';
  title: string;
  ctaText: string;
  ctaLink: string;
  phoneImageUrl: string;
  phoneImageHint?: string;
}


export interface FeatureItem {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface FeaturesBlock extends Block {
    type: 'features';
    title: string;
    subtitle: string;
    features: FeatureItem[];
}

export interface CTABlock extends Block {
    type: 'cta';
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    ctaOpenInNewTab?: boolean;
}

export interface ContactBlock extends Block {
    type: 'contact';
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
}

export interface TestimonialItem {
    id: string;
    quote: string;
    name: string;
    company: string;
}

export interface TestimonialBlock extends Block {
    type: 'testimonial';
    title: string;
    subtitle: string;
    testimonials: TestimonialItem[];
    view: 'grid' | 'carousel';
}

export interface PostsBlock extends Block {
    type: 'posts';
    title: string;
    subtitle: string;
    selectionType: 'latest' | 'favorite';
}

export interface GalleryImage {
    id: string;
    url: string;
    alt: string;
    title?: string;
    description?: string;
}

export interface GalleryBlock extends Block {
    type: 'gallery';
    title: string;
    subtitle: string;
    images: GalleryImage[];
}

export interface LogoItem {
  id: string;
  url: string;
  alt: string;
}

export interface LogoGridBlock extends Block {
    type: 'logo-grid';
    title: string;
    subtitle: string;
    logos: LogoItem[];
}

export interface FounderNoteBlock extends Block {
    type: 'founder-note';
    preTitle: string;
    name: string;
    role: string;
    greeting?: string;
    content: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
    socials?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    }
}

export interface BestAcfBlock extends Block {
    type: 'best-acf';
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
}

export interface ExpandingCardItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  detailsLink: string;
}

export interface ExpandingCardsBlock extends Block {
  type: 'expanding-cards';
  title: string;
  subtitle: string;
  cards: ExpandingCardItem[];
}


export interface HtmlBlock extends Block {
    type: 'html';
    html: string;
}

export interface DividerBlock extends Block {
    type: 'divider';
}

export interface AddressBlock extends Block {
    type: 'address';
    address: string;
    mapImageUrl: string;
    mapImageHint?: string;
    socials?: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        website?: string;
    }
}

export interface NewsletterBlock extends Block {
    type: 'newsletter';
    title: string;
    subtitle: string;
}

export interface MemberItem {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    imageHint?: string;
    linkedinUrl?: string;
}

export interface LeadershipBlock extends Block {
    type: 'leadership';
    title: string;
    subtitle?: string;
    members: MemberItem[];
}

export interface HomePage {
    blocks: Array<Block | HeroBlock | FeaturesBlock | CTABlock | TestimonialBlock | PostsBlock | GalleryBlock | HtmlBlock | DividerBlock | ContactBlock | LogoGridBlock | FounderNoteBlock | BestAcfBlock | BannerBlock | ExpandingCardsBlock | AddressBlock | NewsletterBlock | BannerV2Block | LeadershipBlock>;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    author?: string;
    publisher?: string;
}

export interface BlogSettings {
    listingType: 'dynamic' | 'manual';
    manualOrder: string[];
    layout: 'grid' | 'list';
}

export interface BlockSettings {
    animationSpeed?: number;
}


export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    submittedAt: any;
}

export interface Subscriber {
    id: string;
    name: string;
    email: string;
    subscribedAt: any;
}

export interface Redirect {
    id: string;
    source: string;
    destination: string;
    type: '301' | '302';
    openInNewTab?: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface Widget {
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: any;
    updatedAt: any;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    status: 'active' | 'inactive';
    createdAt: any;
    updatedAt: any;
}
