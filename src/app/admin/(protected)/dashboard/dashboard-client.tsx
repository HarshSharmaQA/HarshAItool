"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Newspaper, Users, Mail, PlusCircle, ArrowRightLeft, ToyBrick, Menu as MenuIcon, Youtube } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { convertTimestamps } from "@/lib/utils";
import ClientOnly from "@/components/client-only";
import { MenuItem, Page, Post } from "@/lib/types";

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

interface DashboardData {
  pagesCount: number;
  postsCount: number;
  usersCount: number;
  contactsCount: number;
  redirectsCount: number;
  widgetsCount: number;
  pdfsCount: number;
  youtubeVideosCount: number;
  headerMenu: { id: 'header'; links: MenuItem[] };
  footerMenu: { id: 'footer'; links: MenuItem[] };
  recentPages: Page[];
  recentPosts: Post[];
  recentUsers: any[];
  recentContacts: any[];
}

function DashboardCard({ title, icon: Icon, value, href }: { title: string, icon: React.ElementType, value: number, href: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Link href={href} className="text-xs text-muted-foreground hover:text-primary">
          View all
        </Link>
      </CardContent>
    </Card>
  );
}

function RecentPages({pages}: {pages: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-headline">Recent Pages</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/pages/new"><PlusCircle className="mr-2 h-4 w-4" /> New Page</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map(page => (
              <TableRow key={page.id}>
                <TableCell><Link href={`/admin/pages/edit/${page.id}`} className="font-medium hover:underline">{page.title}</Link></TableCell>
                <TableCell><Badge variant={page.status === 'public' ? 'default' : 'secondary'}>{page.status}</Badge></TableCell>
                <TableCell><ClientOnly>{page.updatedAt}</ClientOnly></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentPosts({posts}: {posts: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-headline">Recent Posts</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/blog/new"><PlusCircle className="mr-2 h-4 w-4" /> New Post</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell><Link href={`/admin/blog/edit/${post.id}`} className="font-medium hover:underline">{post.title}</Link></TableCell>
                <TableCell><Badge variant={post.status === 'public' ? 'default' : 'secondary'}>{post.status}</Badge></TableCell>
                <TableCell><ClientOnly>{post.publishedAt}</ClientOnly></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function NewUsers({users}: {users: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-headline">New Users</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/users">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={(user.photoURL as string) || undefined} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.displayName || 'No Name'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role || 'user'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentSubmissions({contacts}: {contacts: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-headline">Recent Submissions</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/contacts">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{contact.subject}</TableCell>
                <TableCell><ClientOnly>{contact.submittedAt}</ClientOnly></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    pagesCount: 0,
    postsCount: 0,
    usersCount: 0,
    contactsCount: 0,
    redirectsCount: 0,
    widgetsCount: 0,
    pdfsCount: 0,
    youtubeVideosCount: 0,
    headerMenu: { id: 'header', links: [] },
    footerMenu: { id: 'footer', links: [] },
    recentPages: [],
    recentPosts: [],
    recentUsers: [],
    recentContacts: [],
  });

  // In a real implementation, you would fetch data here
  // For now, we'll just use the initial state

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Pages" value={dashboardData.pagesCount} icon={FileText} href="/admin/pages" />
        <DashboardCard title="Total Blog Posts" value={dashboardData.postsCount} icon={Newspaper} href="/admin/blog" />
        <DashboardCard title="Total Users" value={dashboardData.usersCount} icon={Users} href="/admin/users" />
        <DashboardCard title="Contact Submissions" value={dashboardData.contactsCount} icon={Mail} href="/admin/contacts" />
        <DashboardCard title="PDFs" value={dashboardData.pdfsCount} icon={FileText} href="/admin/pdf-gallery" />
        <DashboardCard title="YouTube Videos" value={dashboardData.youtubeVideosCount} icon={Youtube} href="/admin/youtube-gallery" />
        <DashboardCard title="Redirects" value={dashboardData.redirectsCount} icon={ArrowRightLeft} href="/admin/redirects" />
        <DashboardCard title="Widgets" value={dashboardData.widgetsCount} icon={ToyBrick} href="/admin/widgets" />
        <DashboardCard title="Header Links" value={dashboardData.headerMenu.links.length} icon={MenuIcon} href="/admin/menus" />
        <DashboardCard title="Footer Links" value={dashboardData.footerMenu.links.length} icon={MenuIcon} href="/admin/menus" />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <RecentPages pages={dashboardData.recentPages} />
        <RecentPosts posts={dashboardData.recentPosts} />
        <NewUsers users={dashboardData.recentUsers} />
        <RecentSubmissions contacts={dashboardData.recentContacts} />
      </div>
    </div>
  );
}