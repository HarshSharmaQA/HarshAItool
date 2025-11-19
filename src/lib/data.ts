import { initializeFirebase } from '../firebase/server-initialization';
import type { Page, Post, Menu, Settings, MenuItem, UserProfile, HomePage, Block, BlogSettings, ContactSubmission, Subscriber, Redirect, Widget, ContactSettings, WhatsappSettings, BlockSettings, MarqueeSettings, NotificationPopupSettings, EmailTemplate, PDF, Product, Order, YouTubeVideo, Coupon } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';
import { cache } from 'react';
import { getCountFromServer } from 'firebase/firestore';
import { convertTimestamps } from './utils';

const fetchCollection = cache(async function <T>(collectionName: string, options?: { whereClauses?: {field: string, op: FirebaseFirestore.WhereFilterOp, value: any}[], orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Promise<T[]> {
    try {
        const { db } = initializeFirebase();
        let query: FirebaseFirestore.Query = db.collection(collectionName);
        
        if (options?.whereClauses) {
            options.whereClauses.forEach(clause => {
                query = query.where(clause.field, clause.op, clause.value);
            });
        }
        
        if (options?.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as T));
    } catch (error: any) {
        return [];
    }
});

export const getCollectionCount = cache(async (collectionName: string): Promise<number> => {
  try {
    const { db } = initializeFirebase();
    const snapshot = await db.collection(collectionName).count().get();
    return snapshot.data().count;
  } catch (error: any) {
    return 0;
  }
});


const fetchDocument = cache(async function <T>(collectionName: string, docId: string): Promise<T | null> {
    try {
        const { db } = initializeFirebase();
        const docRef = db.collection(collectionName).doc(docId);
        const snapshot = await docRef.get();
        return snapshot.exists ? { id: snapshot.id, ...convertTimestamps(snapshot.data()) } as T : null;
    } catch (error: any) {
        return null;
    }
});

// Helper to replace widget shortcodes with caching and timeout
const widgetCache = new Map<string, string>();

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]) as Promise<T>;
}

async function processContentWidgets(content: string): Promise<string> {
    // If no widgets, return content as is
    if (!content || !content.includes('[widget')) {
        return content;
    }
    
    const widgetRegex = /\[widget slug="([^"]+)"\]/g;
    const matches = Array.from(content.matchAll(widgetRegex));
    
    // If no matches, return content as is
    if (matches.length === 0) {
        return content;
    }
    
    let processedContent = content;
    
    // Process each match
    for (const match of matches) {
        const slug = match[1];
        const fullMatch = match[0];
        
        // Check cache first
        if (widgetCache.has(slug)) {
            processedContent = processedContent.replace(fullMatch, widgetCache.get(slug)!);
            continue;
        }
        
        try {
            // Only initialize db if we need to fetch widgets
            const { db } = initializeFirebase();
            const widgetsRef = db.collection('widgets');
            const snapshotPromise = widgetsRef.where('slug', '==', slug).limit(1).get();
            
            // Add timeout to prevent hanging
            const snapshot = await withTimeout(snapshotPromise, 5000); // 5 second timeout
            
            if (!snapshot.empty) {
                const widget = snapshot.docs[0].data() as Widget;
                widgetCache.set(slug, widget.content);
                processedContent = processedContent.replace(fullMatch, widget.content);
            } else {
                // If widget not found, remove the shortcode
                processedContent = processedContent.replace(fullMatch, '');
            }
        } catch (error) {
            // If there's an error, remove the shortcode
            processedContent = processedContent.replace(fullMatch, '');
        }
    }
    
    return processedContent;
}

// --- Page Functions ---
export const getPages = cache(async (status?: 'draft' | 'public' | 'all'): Promise<Page[]> => {
    const options: any = {};
    if (status && status !== 'all') {
        options.whereClauses = [{ field: 'status', op: '==', value: status }];
    }
    const pages = await fetchCollection<Page>('pages', options);
    return pages.sort((a, b) => ((b.updatedAt || 0) as number) - ((a.updatedAt || 0) as number));
});

export const getRecentPages = cache(async (limit: number): Promise<Page[]> => {
    return fetchCollection<Page>('pages', { orderBy: { field: 'updatedAt', direction: 'desc' }, limit });
});


export const getPage = cache(async (id: string): Promise<Page | null> => {
    const page = await fetchDocument<Page>('pages', id);
    if (page && page.content) {
      page.content = await processContentWidgets(page.content);
    }
    return page;
});

export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
    try {
        const { db } = initializeFirebase();
        const pagesRef = db.collection('pages');
        const q = pagesRef.where('urlSlug', '==', slug).limit(1);
        const snapshot = await q.get();

        if (snapshot.empty) {
            return null;
        }

        const pageData = { id: snapshot.docs[0].id, ...convertTimestamps(snapshot.docs[0].data()) } as Page;
        
        if (pageData.content) {
            pageData.content = await processContentWidgets(pageData.content);
        }
        return pageData;
    } catch (error: any) {
        return null;
    }
});


// --- Post Functions ---
export const getPosts = cache(async (status: 'draft' | 'public' | 'all' = 'all', limit?: number, isFavorite?: boolean): Promise<Post[]> => {
    const options: any = { whereClauses: [] };
    
    if (status !== 'all') {
        options.whereClauses.push({ field: 'status', op: '==', value: status });
    }

    if (isFavorite) {
        options.whereClauses.push({ field: 'isFavorite', op: '==', value: true });
    }

    if(limit) {
        options.limit = limit;
    }
    
    const posts = await fetchCollection<Post>('posts', options);
    
    return posts.sort((a,b) => (new Date(b.publishedAt as string).getTime()) - (new Date(a.publishedAt as string).getTime()));
});

export const getRecentPosts = cache(async (limit: number): Promise<Post[]> => {
    return fetchCollection<Post>('posts', { orderBy: { field: 'publishedAt', direction: 'desc' }, limit });
});


export const getPost = cache(async (id: string): Promise<Post | null> => {
    const post = await fetchDocument<Post>('posts', id);
    if (post && post.content) {
        post.content = await processContentWidgets(post.content);
    }
    return post;
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
    try {
        const { db } = initializeFirebase();
        const postsRef = db.collection('posts');
        const q = postsRef.where('urlSlug', '==', slug).limit(1);
        const snapshot = await q.get();
        if (snapshot.empty) {
            return null;
        }
        
        const postData = { id: snapshot.docs[0].id, ...convertTimestamps(snapshot.docs[0].data()) } as Post;
        
        if (postData.content) {
            postData.content = await processContentWidgets(postData.content);
        }
        return postData;
    } catch (error: any) {
        return null;
    }
});


// --- Product Functions ---
export const getProducts = cache(async (status: 'draft' | 'published' | 'all' = 'all'): Promise<Product[]> => {
    const options: any = {};
    if (status !== 'all') {
        options.whereClauses = [{ field: 'status', op: '==', value: status }];
    }
    const products = await fetchCollection<Product>('products', options);
    return products.sort((a, b) => a.name.localeCompare(b.name));
});

export const getProduct = cache(async (id: string): Promise<Product | null> => {
    return fetchDocument<Product>('products', id);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
    try {
        const { db } = initializeFirebase();
        const productsRef = db.collection('products');
        const q = productsRef.where('slug', '==', slug).limit(1);
        const snapshot = await q.get();
        if (snapshot.empty) {
            return null;
        }
        const productData = { id: snapshot.docs[0].id, ...convertTimestamps(snapshot.docs[0].data()) } as Product;
        return productData;
    } catch (error: any) {
        return null;
    }
});


// --- Order Functions ---
export const getOrders = cache(async (): Promise<Order[]> => {
    const orders = await fetchCollection<Order>('orders', { orderBy: { field: 'createdAt', direction: 'desc' } });
    return orders;
});

export const getOrder = cache(async (id: string): Promise<Order | null> => {
    return fetchDocument<Order>('orders', id);
});

// --- Coupon Functions ---
export const getCoupons = cache(async (): Promise<Coupon[]> => {
    return fetchCollection<Coupon>('coupons', { orderBy: { field: 'code' } });
});

export const getCoupon = cache(async (id: string): Promise<Coupon | null> => {
    return fetchDocument<Coupon>('coupons', id);
});


// --- Menu Functions ---
export const getMenu = cache(async (id: 'header' | 'footer'): Promise<Menu> => {
    const defaultMenu: Menu = { id, links: [] };
    
    try {
        const menuData = await fetchDocument<Menu>('menus', id);
        if (!menuData) return defaultMenu;
        const links = (menuData.links || []).sort((a: MenuItem, b: MenuItem) => a.order - b.order);
        return { ...menuData, links } as Menu;
    } catch (error: any) {
        return defaultMenu;
    }
});

export const getAdminMenu = cache(async (): Promise<MenuItem[]> => {
    try {
      const menuItems = await fetchCollection<MenuItem>('adminMenu', { orderBy: { field: 'order' } });
      if (menuItems.length > 0) return menuItems;
    } catch (error) {
      console.warn('Could not fetch admin menu, returning default. Error:', (error as Error).message);
    }
    
    // Return default menu if fetch fails or is empty
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard', order: 0 },
      { id: 'content-group', label: 'Content', isGroup: true, icon: 'FileText', order: 1, links: [
        { id: 'homepage', label: 'Homepage', path: '/admin/homepage', icon: 'Home', order: 0 },
        { id: 'pages', label: 'Pages', path: '/admin/pages', icon: 'FileText', order: 1 },
        { id: 'posts', label: 'Blog Posts', path: '/admin/blog', icon: 'Newspaper', order: 2 },
      ]},
      { id: 'ecommerce-group', label: 'E-commerce', isGroup: true, icon: 'ShoppingCart', order: 2, links: [
        { id: 'products', label: 'Products', path: '/admin/products', icon: 'Package', order: 0 },
        { id: 'orders', label: 'Orders', path: '/admin/orders', icon: 'ShoppingBag', order: 1 },
        { id: 'coupons', label: 'Coupons', path: '/admin/marketing/coupons', icon: 'Percent', order: 2 },
      ]},
      { id: 'galleries-group', label: 'Galleries', isGroup: true, icon: 'GalleryHorizontal', order: 3, links: [
        { id: 'pdf-gallery', label: 'PDF Gallery', path: '/admin/pdf-gallery', icon: 'File', order: 0 },
        { id: 'youtube-gallery', label: 'YouTube Gallery', path: '/admin/youtube-gallery', icon: 'Youtube', order: 1 },
      ]},
      { id: 'engagement-group', label: 'Engagement', isGroup: true, icon: 'Users', order: 4, links: [
        { id: 'contacts', label: 'Contacts', path: '/admin/contacts', icon: 'Mail', order: 0 },
        { id: 'subscribers', label: 'Subscribers', path: '/admin/subscribers', icon: 'Mailbox', order: 1 },
      ]},
      { id: 'site-config-group', label: 'Site Configuration', isGroup: true, icon: 'Settings', order: 5, links: [
        { id: 'users', label: 'Users', path: '/admin/users', icon: 'Users', order: 0 },
        { id: 'menus', label: 'Menus', path: '/admin/menus', icon: 'Menu', order: 1 },
        { id: 'widgets', label: 'Widgets', path: '/admin/widgets', icon: 'ToyBrick', order: 2 },
        { id: 'redirects', label: 'Redirects', path: '/admin/redirects', icon: 'ArrowRightLeft', order: 3 },
        { id: 'icons', label: 'Icons', path: '/admin/icons', icon: 'Star', order: 4 },
        { id: 'global-settings', label: 'Global Settings', path: '/admin/settings/global', icon: 'Globe', order: 5 },
        { id: 'block-settings', label: 'Block Settings', path: '/admin/settings/blocks', icon: 'Blocks', order: 6 },
        { id: 'email-settings', label: 'Email Templates', path: '/admin/settings/email', icon: 'Mails', order: 7 },
        { id: 'admin-menu-settings', label: 'Admin Menu', path: '/admin/settings/admin-menu', icon: 'Shield', order: 8 },
      ]},
    ];
  });

// --- Settings Functions ---
export const getSettings = cache(async (): Promise<Settings> => {
  const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'logo');
  const defaultSettings: Settings = {
      siteTitle: 'Stratic CMS',
      siteDescription: 'A modern CMS built with Next.js and Firebase.',
      siteLogoUrl: logoPlaceholder?.imageUrl || '',
      currency: '₹',
  };
  
  try {
      const settingsDocs = await fetchCollection<any>('settings');
      
      const settings: any = { ...defaultSettings };
      
      settingsDocs.forEach(doc => {
          if (doc.id === 'global') {
              Object.assign(settings, doc);
          } else {
              settings[doc.id] = doc;
          }
      });

      // Ensure currency has a default value
      if (!settings.currency) {
          settings.currency = defaultSettings.currency;
      }

      // Fetch all additional settings and attach them to the main settings object
      const [
          headerMenu, 
          footerMenu, 
          whatsappSettings, 
          notificationPopupSettings,
          marqueeSettings
      ] = await Promise.all([
          getMenu('header'),
          getMenu('footer'),
          getWhatsappSettings(),
          getNotificationPopupSettings(),
          getMarqueeSettings()
      ]);
      
      settings.headerMenu = headerMenu;
      settings.footerMenu = footerMenu;
      settings.whatsapp = whatsappSettings;
      settings.notificationPopup = notificationPopupSettings;
      settings.marquee = marqueeSettings;

      return settings as Settings;
  } catch (error: any) {
      console.warn("Could not fetch settings, returning default. Error:", error.message);
      const [
          headerMenu, 
          footerMenu, 
          whatsappSettings, 
          notificationPopupSettings,
          marqueeSettings
      ] = await Promise.all([
        getMenu('header'),
        getMenu('footer'),
        getWhatsappSettings(),
        getNotificationPopupSettings(),
        getMarqueeSettings()
      ]);
      
      return { 
        ...defaultSettings, 
        headerMenu, 
        footerMenu,
        whatsapp: whatsappSettings,
        notificationPopup: notificationPopupSettings,
        marquee: marqueeSettings
      };
  }
});

// --- Contact Settings ---
export const getContactSettings = cache(async (): Promise<ContactSettings> => {
    const defaultSettings: ContactSettings = {
        email: 'contact@example.com',
        phone: '+1 (234) 567-890',
        address: '123 Main Street, Anytown, USA'
    };

    try {
        const settingsData = await fetchDocument<ContactSettings>('settings', 'contact');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch contact settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});

// --- WhatsApp Settings ---
export const getWhatsappSettings = cache(async (): Promise<WhatsappSettings> => {
    const defaultSettings: WhatsappSettings = {
        enabled: true,
        phoneNumber: '+918347223122',
        topics: ["General Inquiry", "Support", "Sales"]
    };

    try {
        const settingsData = await fetchDocument<WhatsappSettings>('settings', 'whatsapp');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch whatsapp settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});

// --- Marquee Settings ---
export const getMarqueeSettings = cache(async (): Promise<MarqueeSettings> => {
    const defaultSettings: MarqueeSettings = {
        enabled: false,
        speed: 25,
        items: [{ id: '1', text: 'Default marquee item', icon: undefined }]
    };

    try {
        const settingsData = await fetchDocument<MarqueeSettings>('settings', 'marquee');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch marquee settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});

// --- Notification Popup Settings ---
export const getNotificationPopupSettings = cache(async (): Promise<NotificationPopupSettings> => {
    const defaultSettings: NotificationPopupSettings = {
        enabled: false,
        title: '',
        message: '',
        ctaText: '',
        ctaLink: ''
    };

    try {
        const settingsData = await fetchDocument<NotificationPopupSettings>('settings', 'notificationPopup');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch notification popup settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});


// --- Block Settings ---
export const getBlockSettings = cache(async (): Promise<BlockSettings> => {
    const defaultSettings: BlockSettings = {
        animationSpeed: 25,
    };

    try {
        const settingsData = await fetchDocument<BlockSettings>('settings', 'blocks');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch block settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});


// --- Blog Settings Functions ---
export const getBlogSettings = cache(async (): Promise<BlogSettings> => {
    const defaultSettings: BlogSettings = {
        listingType: 'dynamic',
        manualOrder: [],
        layout: 'grid',
    };

    try {
        const settingsData = await fetchDocument<BlogSettings>('settings', 'blog');
        return { ...defaultSettings, ...(settingsData || {}) };
    } catch (error: any) {
        console.warn("Could not fetch blog settings, returning default. Error:", error.message);
        return defaultSettings;
    }
});

// --- Email Template Functions ---
export const getEmailTemplates = cache(async (): Promise<EmailTemplate[]> => {
    const defaultTemplates: EmailTemplate[] = [
        {
            id: 'contact-form',
            title: 'Contact Form Submission',
            description: 'Sent to users after they submit the contact form.',
            subject: 'Thanks for contacting us, {{name}}!',
            body: '<p>Hi {{name}},</p><p>We received your message and will get back to you shortly.</p><p><b>Your message:</b></p><blockquote>{{message}}</blockquote>',
            placeholders: ['name', 'message']
        },
        {
            id: 'new-subscriber',
            title: 'New Subscriber Welcome',
            description: 'Sent to new users when they subscribe to the newsletter.',
            subject: 'Welcome to our newsletter, {{name}}!',
            body: "<p>Hi {{name}},</p><p>Thanks for subscribing! You'll now receive our latest updates.</p>",
            placeholders: ['name']
        },
        {
            id: 'new-post',
            title: 'New Post Notification',
            description: 'Sent to all subscribers when a new blog post is published.',
            subject: 'New Post: {{postTitle}}',
            body: '<p>Hi {{name}},</p><p>We just published a new article titled "{{postTitle}}".</p><p><a href="{{postUrl}}">Read it here!</a></p>',
            placeholders: ['name', 'postTitle', 'postUrl']
        }
    ];

    try {
        const { db } = initializeFirebase();
        const templatesRef = db.collection('emailTemplates');
        const snapshot = await templatesRef.get();
        
        let templates: EmailTemplate[];

        if (snapshot.empty) {
            // If no templates exist, create them
            const batch = db.batch();
            defaultTemplates.forEach(t => {
                const docRef = templatesRef.doc(t.id);
                batch.set(docRef, t);
            });
            await batch.commit();
            templates = defaultTemplates;
        } else {
            templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailTemplate));
            
            // Ensure all default templates exist, create if not
            const missingTemplates = defaultTemplates.filter(dt => !templates.some(t => t.id === dt.id));
            if (missingTemplates.length > 0) {
                 const batch = db.batch();
                 missingTemplates.forEach(t => {
                    const docRef = templatesRef.doc(t.id);
                    batch.set(docRef, t);
                 });
                 await batch.commit();
                 templates = [...templates, ...missingTemplates];
            }
        }
        
        // Convert timestamps before returning
        return templates.map(t => convertTimestamps(t)) as EmailTemplate[];

    } catch (error: any) {
        console.warn("Could not fetch email templates, returning default. Error:", error.message);
        return defaultTemplates;
    }
});


// --- User Functions ---
export const getUsers = cache(async (): Promise<UserProfile[]> => {
    return await fetchCollection<UserProfile>('users', { orderBy: { field: 'createdAt', direction: 'desc' } });
});

export const getRecentUsers = cache(async (limit: number): Promise<UserProfile[]> => {
    return fetchCollection<UserProfile>('users', { orderBy: { field: 'createdAt', direction: 'desc' }, limit });
});


export const getUser = cache(async (id: string): Promise<UserProfile | null> => {
    return fetchDocument<UserProfile>('users', id);
});

// --- Homepage Functions ---
export const getHomePage = cache(async (): Promise<HomePage> => {
    const defaultHeroBlock: Block = {
        id: 'default-hero',
        type: 'hero',
        title: 'Welcome to Stratic!',
        subtitle: 'Your journey to a powerful, static-first website begins here.',
        ctaText: 'Get Started',
        ctaLink: '/admin'
    };
    const defaultHomePage: HomePage = {
        blocks: [defaultHeroBlock]
    };
    
    try {
        const homePageData = await fetchDocument<HomePage>('settings', 'homepage');
        if (!homePageData || !homePageData.blocks || homePageData.blocks.length === 0) {
            return defaultHomePage;
        }
        return homePageData;
    } catch (error: any) {
        console.warn("Could not fetch homepage settings, returning default. Error:", error.message);
        return defaultHomePage;
    }
});

// --- Contact Submissions ---
export const getContactSubmissions = cache(async (): Promise<ContactSubmission[]> => {
    return fetchCollection<ContactSubmission>('contacts', { orderBy: { field: 'submittedAt', direction: 'desc' } });
});

export const getRecentContactSubmissions = cache(async (limit: number): Promise<ContactSubmission[]> => {
    return fetchCollection<ContactSubmission>('contacts', { orderBy: { field: 'submittedAt', direction: 'desc' }, limit });
});


// --- Subscriber Functions ---
export const getSubscribers = cache(async (): Promise<Subscriber[]> => {
    return fetchCollection<Subscriber>('subscribers', { orderBy: { field: 'subscribedAt', direction: 'desc' } });
});

// --- Redirect Functions ---
export const getRedirects = cache(async (): Promise<Redirect[]> => {
    return await fetchCollection<Redirect>('redirects');
});

export const getRedirect = cache(async (id: string): Promise<Redirect | null> => {
    return fetchDocument<Redirect>('redirects', id);
});

// --- Widget Functions ---
export const getWidgets = cache(async (): Promise<Widget[]> => {
    return fetchCollection<Widget>('widgets', { orderBy: { field: 'createdAt', direction: 'desc' } });
});

export const getWidget = cache(async (id: string): Promise<Widget | null> => {
    return fetchDocument<Widget>('widgets', id);
});

// --- PDF Gallery Functions ---
export const getPdfs = cache(async (): Promise<PDF[]> => {
    return fetchCollection<PDF>('pdfGallery', { orderBy: { field: 'createdAt', direction: 'desc' } });
});

// --- YouTube Gallery Functions ---
export const getYouTubeVideos = cache(async (): Promise<YouTubeVideo[]> => {
    return fetchCollection<YouTubeVideo>('youtubeVideos', { orderBy: { field: 'createdAt', direction: 'desc' } });
});

export const getYouTubeVideo = cache(async (id: string): Promise<YouTubeVideo | null> => {
    return fetchDocument<YouTubeVideo>('youtubeVideos', id);
});
