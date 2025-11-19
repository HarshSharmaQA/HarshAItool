

import ContactForm from "@/components/contact-form";
import type { Metadata } from 'next';
import Image from 'next/image';
import { getSettings, getContactSettings } from '@/lib/data';
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/image-with-fallback";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us',
    description: 'Get in touch with us. We are here to help you with any questions.',
    alternates: {
      canonical: 'https://harshsharmaqa.info/contact',
    },
  };
}

export default async function ContactPage() {
    const settings = await getSettings();
    const contactSettings = await getContactSettings();
    const contactImage = PlaceHolderImages.find(p => p.id === 'blog-2');

    const socialLinks = [
        { platform: 'twitter', url: settings.socialTwitter, icon: <Twitter className="h-5 w-5" /> },
        { platform: 'facebook', url: settings.socialFacebook, icon: <Facebook className="h-5 w-5" /> },
        { platform: 'instagram', url: settings.socialInstagram, icon: <Instagram className="h-5 w-5" /> },
        { platform: 'linkedin', url: settings.socialLinkedin, icon: <Linkedin className="h-5 w-5" /> },
        { platform: 'youtube', url: settings.socialYoutube, icon: <Youtube className="h-5 w-5" /> },
      ].filter(link => link.url);

  return (
    <div className="bg-background">
      <header className="relative py-24 sm:py-32 bg-secondary/50 overflow-hidden">
        {contactImage && (
            <div className="absolute inset-0">
                <ImageWithFallback
                    src={contactImage.imageUrl}
                    alt={contactImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={contactImage.imageHint}
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
            </div>
        )}
        <div className="container mx-auto px-4 text-center relative">
            <h1 className="font-headline text-center text-4xl sm:text-5xl md:text-6xl">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question or want to work together? Drop us a line. We are here to help.
            </p>
        </div>
      </header>

      <div className="container mx-auto py-16 sm:py-24 px-4">
            <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-headline font-semibold">Get in Touch</h2>
                        <p className="text-muted-foreground">
                            We'd love to hear from you. Fill out the form, and we'll get back to you as soon as possible.
                        </p>
                    </div>
                    <div className="space-y-6">
                        {contactSettings.email && (
                            <div className="flex items-center gap-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <a href={`mailto:${contactSettings.email}`} className="text-muted-foreground hover:text-primary">{contactSettings.email}</a>
                                </div>
                            </div>
                        )}
                         {contactSettings.phone && (
                            <div className="flex items-center gap-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Call Us</h3>
                                    <a href={`tel:${contactSettings.phone}`} className="text-muted-foreground hover:text-primary">{contactSettings.phone}</a>
                                </div>
                            </div>
                         )}
                         {contactSettings.address && (
                            <div className="flex items-center gap-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Our Office</h3>
                                    <p className="text-muted-foreground">{contactSettings.address}</p>
                                </div>
                            </div>
                         )}
                    </div>
                    {socialLinks.length > 0 && (
                        <div className="pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                             <div className="flex space-x-2">
                                {socialLinks.map(social => (
                                    <Button key={social.platform} asChild variant="outline" size="icon">
                                        <Link href={social.url!} target="_blank" rel="noopener noreferrer" aria-label={`Visit our ${social.platform} page`} className="text-muted-foreground hover:text-primary">
                                            {social.icon}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div>
                     <div className="bg-card p-8 rounded-lg shadow-lg border">
                        <ContactForm />
                     </div>
                </div>
            </div>
      </div>
    </div>
  );
}
