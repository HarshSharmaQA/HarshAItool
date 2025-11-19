# Stratic CMS - A Next.js & Firebase Powered CMS

Welcome to Stratic CMS, a powerful, flexible, and modern Content Management System built on a foundation of cutting-edge technologies. This platform is designed to provide a seamless content editing experience, enabling you to build and manage statically-generated websites with ease.

## Core Technologies

This project leverages a modern, type-safe, and performant tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **UI Library**: [React](https://react.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) for componentry.
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) for AI-powered features.
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## Key Features

### 1. Content Management

-   **Pages**: A full-featured page editor to create, edit, publish, and delete static pages. Each page includes advanced SEO controls, custom CSS/HTML injection, and a block-based content editor.
-   **Blog**: A robust blogging engine supporting categories, author management, featured images, and per-post SEO settings. You can feature posts, mark them as favorites, and manage related content.
-   **Widgets**: Create reusable blocks of HTML content (widgets) that can be embedded anywhere on your site using a simple shortcode like `[widget slug="your-widget-slug"]`.

### 2. Block-Based Editor

Build dynamic and engaging landing pages and posts using a powerful block-based editor. Drag and drop to reorder sections and customize each block to fit your needs. Available blocks include:

-   **Hero**: A prominent hero section to capture attention.
-   **Banner**: Full-width banner with auto-playing slides, social links, and theme options.
-   **Features**: Showcase key product or service features with icons and descriptions.
-   **Founder Note**: A personal message from the founder, complete with an image and social media links.
-   **Expanding Cards**: An interactive set of cards that expand on hover or click.
-   **Testimonial**: Display customer quotes in a grid or a dynamic carousel.
-   **Recent Posts**: Automatically showcase your latest or favorite blog posts.
-   **Logo Grid**: Display partner or client logos in a grid or an infinite-scrolling carousel.
-   **Gallery**: Create beautiful image galleries.
-   **CTA (Call to Action)**: Drive user engagement with a prominent CTA section.
-   **Contact Form**: A dedicated block for your contact form.
-   **Custom HTML & Divider**: Inject custom code or add a simple visual separator.

### 3. Site-wide Settings & Customization

-   **Global Settings**: Manage your site's title, description, logo, favicon, and social media profiles from a central dashboard.
-   **Appearance**: Instantly switch between multiple color themes (`Light`, `Dark`, `Dramatic`, `System`) for your entire website.
-   **Menus**: A drag-and-drop menu editor to control your header and footer navigation, with support for nested/group links.
-   **Redirects**: Easily manage 301 and 302 URL redirects to maintain SEO equity.
-   **Contact Details**: Configure the email, phone, and address displayed on your contact page.

### 4. User Engagement & Utilities

-   **WhatsApp Button**: A floating WhatsApp button with pre-defined conversation topics.
-   **Marquee Banner**: A scrolling text banner at the top of the page for announcements.
-   **Notification Popup**: A global, dismissible pop-up for special offers or important news.

### 5. Authentication & User Roles

-   **Google Authentication**: Secure sign-in for administrators using Firebase Authentication.
-   **Role-Based Access Control**: A simple user role system (`admin` or `user`) to control access to the admin panel. New users are automatically created on their first sign-in.

### 6. AI-Powered Features

-   **Content Suggestions**: Get AI-powered suggestions to help you write and improve your page content.
-   **Site Search**: An intelligent, AI-powered site search that understands user intent to deliver the most relevant pages and posts.

## Getting Started

1.  **Navigate to the Admin Panel**: Access the admin dashboard by visiting `/admin`.
2.  **Sign In**: Log in using your authorized Google account.
3.  **Explore**:
    -   Start by customizing your site's look and feel under **Site Settings > Global**.
    -   Build your homepage using the block editor under the **Homepage** section.
    -   Create your first page or blog post.
    -   Configure your navigation menus under the **Menus** section.

## Codebase Overview

This section provides a detailed breakdown of the files in this project and their purpose.

### Root Directory

-   `.env`: Stores environment variables. This file is used for local development and should not be committed to version control.
-   `README.md`: This file, providing an overview of the project.
-   `apphosting.yaml`: Configuration file for Firebase App Hosting, specifying settings like the number of instances.
-   `components.json`: Configuration for ShadCN UI, defining component paths, styling, and aliases.
-   `firebase.json`: Main Firebase configuration file for services like Hosting and Functions, defining deployment settings.
-   `firestore.rules`: Defines the security rules for accessing the Firestore database, ensuring data is protected.
-   `next.config.js`: Configuration file for Next.js, including image optimization settings and remote patterns.
-   `package.json`: Lists the project's dependencies and scripts for development, building, and deployment.
-   `tsconfig.json`: TypeScript configuration file, specifying compiler options and file paths.

### `src/` Directory

#### `src/ai/`

-   `genkit.ts`: Initializes and configures the Genkit AI framework with the Google AI plugin.
-   `dev.ts`: Entry point for running Genkit in development mode, importing all AI flows.
-   `flows/content-suggestions.ts`: Genkit flow to generate content suggestions based on existing text.
-   `flows/humanize-content.ts`: Genkit flow to rewrite content to sound more human and engaging.
-   `flows/search.ts`: Genkit flow for AI-powered site search, ranking documents based on relevance to a query.

#### `src/app/`

-   `layout.tsx`: The root layout for the entire application, setting up the HTML structure, fonts, and global providers.
-   `globals.css`: Global stylesheet, including Tailwind CSS directives and theme definitions for colors and styles.
-   `[slug]/page.tsx`: Dynamic page renderer for all static pages created in the CMS.
-   `blog/[slug]/page.tsx`: Dynamic page renderer for individual blog posts.
-   `blog/page.tsx`: The main blog listing page, which displays all published posts.
-   `contact/page.tsx`: The public-facing contact page, including the contact form and business details.
-   `products/page.tsx`: The main product listing page for the e-commerce section.
-   `products/[slug]/page.tsx`: Dynamic page renderer for individual product details.
-   `checkout/page.tsx`: The main checkout page.
-   `account/page.tsx`: The user account page, which displays order history and profile details.

##### `src/app/admin/`

-   `layout.tsx`: Layout for the protected admin section, wrapping pages with the admin sidebar and header.
-   `login/page.tsx`: The admin login page, handling Google Authentication.
-   `dashboard/page.tsx`: The main dashboard for the admin panel, showing an overview of site statistics and recent activity.
-   `pages/page.tsx`, `blog/page.tsx`, etc.: Pages for managing all content types within the admin panel (listing, creating, editing, deleting).
-   `settings/`: Contains sub-pages for managing various site settings, such as global settings, menus, and redirects.

#### `src/components/`

-   `ui/`: Contains all the ShadCN UI components like `Button`, `Card`, `Input`, etc.
-   `providers/`: React Context providers for managing global state like user authentication and theme settings.
-   `layout/`: Components used for the main site layout, such as `Header`, `Footer`, and `Marquee`.
-   `admin/`: Components specific to the admin dashboard, like the sidebar and breadcrumbs.
-   `page-blocks/`: Contains the React components for each of the block types available in the block editor (e.g., Hero, Features, CTA).
-   `contact-form.tsx`: The client-side component for the contact form, including form validation and submission logic.
-   `search.tsx`: The client-side component for the site search functionality.

#### `src/firebase/`

-   `config-admin.js` / `config-admin.ts`: Server-side configuration for the Firebase Admin SDK. **Contains sensitive credentials and must not be exposed to the client.**
-   `config.ts`: Client-side Firebase configuration, which is safe to expose.
-   `server-initialization.ts`: Initializes the Firebase Admin SDK for use in server-side environments.
-   `client-provider.tsx`: A client component that provides the Firebase context to the application.
-   `auth/use-user.tsx`: A custom React hook for accessing the current user's authentication state and profile.
-   `firestore/`: Contains custom hooks (`useCollection`, `useDoc`) for real-time data fetching from Firestore.

#### `src/lib/`

-   `data.ts`: Centralized data fetching functions for retrieving content from Firestore.
-   `firebase.ts`: Initializes the client-side Firebase app.
-   `utils.ts`: Utility functions used throughout the application, such as `cn` for classnames and `convertTimestamps`.
-   `types.ts`: TypeScript type definitions for all major data structures in the application.

#### `src/hooks/`

-   `use-toast.ts`: A custom hook for displaying toast notifications.
-   `use-cart.tsx`: A custom hook and provider for managing the e-commerce shopping cart state.
-   `use-debounce.ts`: A utility hook to debounce input values, useful for search functionality.

### `/functions/` Directory

-   `src/index.ts`: The main entry point for all Firebase Cloud Functions, including triggers for sending emails on certain database events.
-   `package.json`: Lists the dependencies for the Cloud Functions environment.

Enjoy building with Stratic CMS!
