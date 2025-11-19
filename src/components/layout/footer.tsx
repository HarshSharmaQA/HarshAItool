
'use client';

import Link from "next/link";
import type { Menu, Settings, MenuItem } from "@/lib/types";
import Logo from "../icons/logo";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface FooterProps {
  settings: Settings;
  menu: Menu;
}

const FooterLink = ({ link }: { link: MenuItem }) => (
  <li>
    <Link href={link.path || '#'} className="text-base text-muted-foreground hover:text-foreground capitalize">
      {link.label}
    </Link>
  </li>
);

export default function Footer({ settings, menu }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'logo')?.imageUrl;
  const logoSrc = settings.siteLogoUrl || logoPlaceholder;

  const socialLinks = [
    { platform: 'twitter', url: settings.socialTwitter, icon: <Twitter className="h-5 w-5" /> },
    { platform: 'facebook', url: settings.socialFacebook, icon: <Facebook className="h-5 w-5" /> },
    { platform: 'instagram', url: settings.socialInstagram, icon: <Instagram className="h-5 w-5" /> },
    { platform: 'linkedin', url: settings.socialLinkedin, icon: <Linkedin className="h-5 w-5" /> },
    { platform: 'youtube', url: settings.socialYoutube, icon: <Youtube className="h-5 w-5" /> },
  ].filter(link => link.url);
  
  const linkGroups = menu.links.filter(link => link.isGroup);
  const ungroupedLinks = menu.links.filter(link => !link.isGroup);
  
  const copyrightText = settings.copyrightText
    ? settings.copyrightText.replace('{year}', currentYear.toString()).replace('{siteTitle}', settings.siteTitle)
    : `© ${currentYear} ${settings.siteTitle}. All rights reserved.`;

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-8">
             <Link href="/" className="flex items-center space-x-2">
                {logoSrc ? (
                  <Image 
                    src={logoSrc} 
                    alt={`${settings.siteTitle} logo`}
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain', width: 'auto', height: '32px' }}
                    className="h-8 w-auto"
                    unoptimized
                  />
                ) : (
                  <Logo className="h-8 w-auto text-primary" />
                )}
                <span className="font-bold text-xl font-headline">
                  {settings.siteTitle}
                </span>
            </Link>
            <p className="text-muted-foreground text-base max-w-xs">
              {settings.siteDescription}
            </p>
             {socialLinks.length > 0 && (
                <div className="flex space-x-2">
                    {socialLinks.map(social => (
                        <Button key={social.platform} asChild variant="ghost" size="icon">
                            <a href={social.url!} target="_blank" rel="noopener noreferrer" aria-label={`Visit our ${social.platform} page`} className="text-muted-foreground hover:text-foreground">
                                {social.icon}
                            </a>
                        </Button>
                    ))}
                </div>
            )}
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
             {linkGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
                  <Link href={group.path || "#"}>{group.label}</Link>
                </h3>
                <ul className="mt-4 space-y-4">
                  {group.links?.map((link) => (
                    <FooterLink key={link.id} link={link} />
                  ))}
                </ul>
              </div>
            ))}
            {ungroupedLinks.length > 0 && (
                 <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">{menu.title || "Navigation"}</h3>
                    <ul className="mt-4 space-y-4">
                    {ungroupedLinks.map((link) => (
                        <FooterLink key={link.id} link={link} />
                    ))}
                    </ul>
              </div>
            )}
          </div>

        </div>
        <div className="mt-16 border-t pt-8">
          <p className="text-base text-muted-foreground text-center">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
