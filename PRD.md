# Product Requirements Document (PRD) - Stratic CMS

## 1. Executive Summary
Stratic CMS is a modern, static-first Content Management System built with Next.js and Firebase. It provides a powerful, user-friendly interface for managing website content, e-commerce functionality, and user engagement. The system is designed to be fast, secure, and highly customizable through a block-based page builder and extensive configuration options.

## 2. Product Scope
The product encompasses a public-facing website and a comprehensive admin dashboard.
- **Public Website**: A responsive, SEO-optimized frontend displaying dynamic content, a blog, an e-commerce store, and various galleries.
- **Admin Dashboard**: A secure backend for administrators to manage all aspects of the site, including content, users, orders, and settings.

## 3. User Roles
- **Admin**: Full access to all features, settings, and data.
- **User**: Access to public content, account management, order history, and authenticated features.
- **Guest**: Access to public content (Home, Blog, Shop, etc.).

## 4. Functional Requirements

### 4.1 Content Management
#### 4.1.1 Pages
- **Dynamic Page Builder**: Create pages using a variety of pre-built blocks (Hero, Features, CTA, Testimonials, Gallery, etc.).
- **SEO Management**: Customize Title, Description, Keywords, and Canonical URL per page.
- **Status Control**: Draft vs. Public visibility.
- **Customization**: Support for custom CSS, Head content, and Schema markup.

#### 4.1.2 Blog
- **Post Management**: Create, edit, and delete blog posts.
- **Categorization**: Organize posts with tags/categories.
- **Rich Text Editor**: WYSIWYG editor for post content.
- **Featured Images**: Upload and manage cover images.
- **Related Posts**: Automatic or manual selection of related content.

#### 4.1.3 Homepage
- **Block-Based Editor**: Fully customizable homepage using the same block system as pages.
- **Reordering**: Drag-and-drop interface to reorder sections.

#### 4.1.4 Galleries
- **PDF Gallery**: Upload and manage PDF documents with descriptions and categories.
- **YouTube Gallery**: Curate a collection of YouTube videos.

### 4.2 E-commerce
#### 4.2.1 Products
- **Product Management**: Create/Edit products with Name, Description, Price, SKU, and Stock.
- **Media**: Product image management.
- **SEO**: Product-specific SEO settings.
- **Status**: Draft/Published states.

#### 4.2.2 Orders
- **Order Tracking**: View and manage customer orders.
- **Status Updates**: Update order status (Pending, Shipped, Delivered, Cancelled).
- **Details**: View shipping address, items, and totals.

#### 4.2.3 Marketing
- **Coupons**: Create percentage or fixed-amount discount codes.

### 4.3 User & Engagement
#### 4.3.1 User Management
- **User List**: View and manage registered users.
- **Role Management**: Assign Admin or User roles.
- **Approval System**: Optional user approval workflow.

#### 4.3.2 Communications
- **Contact Forms**: View submissions from the public contact form.
- **Subscribers**: Manage newsletter subscribers.
- **Email Templates**: Customize automated emails (Welcome, Contact Receipt, etc.) with a real-time preview editor.

### 4.4 Site Configuration
#### 4.4.1 General Settings
- **Site Identity**: Title, Description, Logo, Favicon.
- **Theming**: Light, Dark, System, and "Dramatic" theme options.
- **Social Media**: Links for Twitter, Facebook, Instagram, LinkedIn, YouTube.
- **Analytics**: Google Analytics integration.

#### 4.4.2 Navigation
- **Menu Builder**: Drag-and-drop builder for Header and Footer menus.
- **Admin Menu**: Customizable sidebar menu for the admin panel.

#### 4.4.3 Integrations & Tools
- **WhatsApp**: Floating WhatsApp chat widget configuration.
- **Marquee**: Top banner scrolling text with customizable speed and direction.
- **Notification Popup**: Global popup for announcements/promotions.
- **Redirects**: Manage 301/302 redirects.
- **Widgets**: Create reusable content snippets via shortcodes.

## 5. Technical Architecture
- **Frontend**: Next.js (React) with Tailwind CSS.
- **Backend/Database**: Firebase (Firestore, Auth, Functions).
- **Styling**: Tailwind CSS with a custom design system (shadcn/ui components).
- **State Management**: React Hooks and Context.
- **Form Handling**: React Hook Form with Zod validation.

## 6. UI/UX Design Guidelines
- **Responsive Design**: Mobile-first approach ensuring usability across all devices.
- **Aesthetics**: Modern, clean interface with support for dark mode.
- **Feedback**: Real-time validation, toast notifications, and loading states.
- **Accessibility**: Semantic HTML and ARIA attributes where necessary.

## 7. Future Roadmap
- **Advanced Analytics Dashboard**: Native charts and graphs for site performance.
- **Multi-language Support**: i18n integration for global reach.
- **Digital Products**: Support for downloadable products in the store.
- **User Roles**: More granular permission levels (Editor, Author, etc.).
