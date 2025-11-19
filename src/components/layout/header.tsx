'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon, LayoutDashboard, User as UserIcon, LogOut as LogOutIcon, LogIn } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/components/providers/app-providers';
import type { Menu, MenuItem, Settings } from '@/lib/types';
import Logo from '../icons/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Search from '../search';
import ClientOnly from '../client-only';
import CartSheet from '../cart/cart-sheet';
import { Avatar, AvatarFallback } from '../ui/avatar';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { description?: string }
>(({ className, title, children, href, description, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || '/'}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none capitalize">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

const MobileMenuLink = ({
  link,
  onLinkClick,
  pathname,
}: {
  link: MenuItem;
  onLinkClick: () => void;
  pathname: string;
}) => {
  const hasChildren = link.links && link.links.length > 0;

  if (hasChildren) {
    return (
      <AccordionItem value={link.id} className="border-b-0">
        <AccordionTrigger className="p-2 justify-start text-base hover:bg-accent hover:no-underline rounded-md">
          <span className="font-medium">{link.label}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-1 pl-4">
          <div className="flex flex-col space-y-1">
            {link.links?.map((child) => (
              <Button
                key={child.id}
                variant={pathname === child.path ? 'secondary' : 'ghost'}
                asChild
                className="justify-start text-base capitalize"
              >
                <Link href={child.path || '#'} onClick={onLinkClick}>
                  {child.label}
                </Link>
              </Button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Button
      variant={pathname === link.path ? 'secondary' : 'ghost'}
      asChild
      className="justify-start text-base"
    >
      <Link href={link.path || '#'} onClick={onLinkClick}>
        {link.label}
      </Link>
    </Button>
  );
};

interface HeaderProps {
  settings: Settings;
  menu: Menu;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function Header({ settings, menu }: HeaderProps) {
  const { user, userProfile, isAdmin, signOut } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const logoPlaceholder = PlaceHolderImages.find((p) => p.id === 'logo')?.imageUrl;
  const logoSrc = settings.siteLogoUrl || logoPlaceholder;

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleSignOut = () => {
    signOut();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {logoSrc ? (
              <div className="relative h-8" style={{ width: 'auto' }}>
                <Image
                  src={logoSrc}
                  alt={`${settings.siteTitle} logo`}
                  width={32}
                  height={32}
                  style={{ objectFit: 'contain', height: '100%', width: 'auto' }}
                  unoptimized
                />
              </div>
            ) : (
              <Logo className="h-6 w-auto text-primary" />
            )}
            <span className="hidden font-bold sm:inline-block font-headline">
              {settings.siteTitle}
            </span>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <ClientOnly>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6 text-current" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    A list of navigation links for the site.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4">
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-2 mb-8"
                  >
                    {logoSrc ? (
                      <Image
                        src={logoSrc}
                        alt={`${settings.siteTitle} logo`}
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <Logo className="h-6 w-auto text-primary" />
                    )}
                    <span className="font-bold font-headline">
                      {settings.siteTitle}
                    </span>
                  </Link>
                  <div className="flex flex-col space-y-1">
                    <Accordion type="multiple" className="w-full">
                      {menu.links.map((link) => (
                        <div key={link.id}>
                          <MobileMenuLink
                            link={link}
                            onLinkClick={handleLinkClick}
                            pathname={pathname}
                          />
                        </div>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </ClientOnly>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end space-x-2">
          <Link href="/" className="flex items-center space-x-2 md:hidden">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={`${settings.siteTitle} logo`}
                width={24}
                height={24}
                className="object-contain"
                unoptimized
              />
            ) : (
              <Logo className="h-6 w-auto text-primary" />
            )}
            <span className="font-bold font-headline">
              {settings.siteTitle}
            </span>
          </Link>

          <ClientOnly>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {menu.links.map((link) => (
                  <NavigationMenuItem key={link.id}>
                    {link.isGroup && link.links && link.links.length > 0 ? (
                      <>
                        <NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                              <NavigationMenuLink asChild>
                                <a
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                  href={link.path || '/'}
                                >
                                  <div className="mb-2 mt-4 text-lg font-medium">
                                    {link.label}
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    {link.description ||
                                      `Explore all ${link.label.toLowerCase()}.`}
                                  </p>
                                </a>
                              </NavigationMenuLink>
                            </li>
                            {link.links.map((child) => (
                              <ListItem
                                key={child.id}
                                title={child.label}
                                href={child.path}
                                description={child.description}
                              />
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        asChild
                        className={navigationMenuTriggerStyle()}
                      >
                        <Link href={link.path || '#'}>{link.label}</Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </ClientOnly>
          <div className="flex items-center gap-2">
            <ClientOnly>
                <Search />
            </ClientOnly>
            <ClientOnly>
              <CartSheet />
            </ClientOnly>
            <ClientOnly>
                {user ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full border-2 border-primary/20 hover:border-primary transition-colors">
                        <Avatar>
                            <AvatarFallback>{getInitials(userProfile?.displayName || userProfile?.email)}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                              <p className="text-xs leading-none text-muted-foreground">
                              {userProfile?.email}
                              </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/account"><UserIcon className="mr-2 h-4 w-4 text-current" />My Account</Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4 text-current" />Admin Dashboard</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOutIcon className="mr-2 h-4 w-4 text-current" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                     <Button asChild size="sm" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4 text-current"/>
                          <span>Login</span>
                        </Link>
                    </Button>
                )}
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>
  );
}