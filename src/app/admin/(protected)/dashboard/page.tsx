
import Link from "next/link";
import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Newspaper, Users, Mail, PlusCircle, ArrowRightLeft, ToyBrick, Menu as MenuIcon, Youtube } from "lucide-react";
import { getCollectionCount, getRecentPages, getRecentPosts, getRecentUsers, getRecentContactSubmissions, getRedirects, getWidgets, getMenu, getPdfs, getYouTubeVideos } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { convertTimestamps } from "@/lib/utils";
import ClientOnly from "@/components/client-only";

const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

async function DashboardCard({ title, icon: Icon, value, href }: { title: string, icon: React.ElementType, value: number, href: string }) {
  return (
      <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
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


const RecentPages = memo(function RecentPages({pages}: {pages: any[]}) {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-headline">Recent Pages</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href="/admin/pages/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  New Page
                </Link>
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
                    {Array.isArray(pages) && pages.length > 0 ? pages.map(page => {
                        // Ensure page data is properly formatted
                        const title = typeof page.title === 'string' ? page.title : 'Untitled';
                        const status = typeof page.status === 'string' ? page.status : 'draft';
                        const updatedAt = page.updatedAt ? 
                          (typeof page.updatedAt === 'string' ? page.updatedAt : 
                           page.updatedAt instanceof Date ? page.updatedAt.toLocaleDateString() : 
                           'Unknown date') : 'Never';
                           
                        return (
                        <TableRow key={page.id || Math.random()}>
                            <TableCell>
                              <Link href={`/admin/pages/edit/${page.id}`} className="font-medium hover:underline">
                                {title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status === 'public' ? 'default' : 'secondary'}>
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ClientOnly>
                                {updatedAt}
                              </ClientOnly>
                            </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={3}>No pages found</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
});

const RecentPosts = memo(function RecentPosts({posts}: {posts: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-headline">Recent Posts</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/blog/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
              </Link>
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
                  {Array.isArray(posts) && posts.length > 0 ? posts.map(post => {
                      // Ensure post data is properly formatted
                      const title = typeof post.title === 'string' ? post.title : 'Untitled';
                      const status = typeof post.status === 'string' ? post.status : 'draft';
                      const publishedAt = post.publishedAt ? 
                        (typeof post.publishedAt === 'string' ? post.publishedAt : 
                         post.publishedAt instanceof Date ? post.publishedAt.toLocaleDateString() : 
                         'Unknown date') : 'Never';
                         
                      return (
                        <TableRow key={post.id || Math.random()}>
                            <TableCell>
                              <Link href={`/admin/blog/edit/${post.id}`} className="font-medium hover:underline">
                                {title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status === 'public' ? 'default' : 'secondary'}>
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ClientOnly>
                                {publishedAt}
                              </ClientOnly>
                            </TableCell>
                        </TableRow>
                      );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={3}>No posts found</TableCell>
                    </TableRow>
                  )}
              </TableBody>
          </Table>
      </CardContent>
    </Card>
  )
});

const NewUsers = memo(function NewUsers({users}: {users: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-headline">New Users</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                View All
              </Link>
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
                  {Array.isArray(users) && users.length > 0 ? users.map(user => {
                      // Ensure user data is properly formatted
                      const displayName = typeof user.displayName === 'string' ? user.displayName : 'No Name';
                      const email = typeof user.email === 'string' ? user.email : 'No Email';
                      const photoURL = typeof user.photoURL === 'string' ? user.photoURL : undefined;
                      const role = typeof user.role === 'string' ? user.role : 'user';
                      
                      return (
                        <TableRow key={user.id || user.uid || Math.random()}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={photoURL} />
                                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{displayName || 'No Name'}</span>
                                        <span className="text-xs text-muted-foreground">{email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                {role || 'user'}
                              </Badge>
                            </TableCell>
                        </TableRow>
                      );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={2}>No users found</TableCell>
                    </TableRow>
                  )}
              </TableBody>
          </Table>
      </CardContent>
    </Card>
  )
});

const RecentSubmissions = memo(function RecentSubmissions({contacts}: {contacts: any[]}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-headline">Recent Submissions</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/contacts">
                <Mail className="mr-2 h-4 w-4" />
                View All
              </Link>
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
                  {Array.isArray(contacts) && contacts.length > 0 ? contacts.map(contact => {
                      // Ensure contact data is properly formatted
                      const name = typeof contact.name === 'string' ? contact.name : 'Anonymous';
                      const email = typeof contact.email === 'string' ? contact.email : 'No Email';
                      const subject = typeof contact.subject === 'string' ? contact.subject : 'No Subject';
                      const submittedAt = contact.submittedAt ? 
                        (typeof contact.submittedAt === 'string' ? contact.submittedAt : 
                         contact.submittedAt instanceof Date ? contact.submittedAt.toLocaleDateString() : 
                         'Unknown date') : 'Unknown';
                         
                      return (
                        <TableRow key={contact.id || Math.random()}>
                            <TableCell>
                              <div className="flex flex-col">
                                  <span className="font-medium">{name}</span>
                                  <span className="text-xs text-muted-foreground">{email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{subject}</TableCell>
                            <TableCell>
                              <ClientOnly>
                                {submittedAt}
                              </ClientOnly>
                            </TableCell>
                        </TableRow>
                      );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={3}>No submissions found</TableCell>
                    </TableRow>
                  )}
              </TableBody>
          </Table>
      </CardContent>
    </Card>
  )
});

export default async function Dashboard() {
  const [
    pagesCount,
    postsCount,
    usersCount,
    contactsCount,
    redirectsCount,
    widgetsCount,
    pdfsCount,
    youtubeVideosCount,
    headerMenu,
    footerMenu,
    recentPagesData,
    recentPostsData,
    recentUsersData,
    recentContactsData,
  ] = await Promise.all([
    getCollectionCount('pages'),
    getCollectionCount('posts'),
    getCollectionCount('users'),
    getCollectionCount('contacts'),
    getCollectionCount('redirects'),
    getCollectionCount('widgets'),
    getCollectionCount('pdfGallery'),
    getCollectionCount('youtubeVideos'),
    getMenu('header'),
    getMenu('footer'),
    getRecentPages(5),
    getRecentPosts(5),
    getRecentUsers(5),
    getRecentContactSubmissions(5),
  ]);

  const recentPages = recentPagesData.map(convertTimestamps);
  const recentPosts = recentPostsData.map(convertTimestamps);
  const recentUsers = recentUsersData.map(convertTimestamps);
  const recentContacts = recentContactsData.map(convertTimestamps);
  
  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Total Pages" value={pagesCount} icon={FileText} href="/admin/pages" />
            <DashboardCard title="Total Blog Posts" value={postsCount} icon={Newspaper} href="/admin/blog" />
            <DashboardCard title="Total Users" value={usersCount} icon={Users} href="/admin/users" />
            <DashboardCard title="Contact Submissions" value={contactsCount} icon={Mail} href="/admin/contacts" />
            <DashboardCard title="PDFs" value={pdfsCount} icon={FileText} href="/admin/pdf-gallery" />
            <DashboardCard title="YouTube Videos" value={youtubeVideosCount} icon={Youtube} href="/admin/youtube-gallery" />
            <DashboardCard title="Redirects" value={redirectsCount} icon={ArrowRightLeft} href="/admin/redirects" />
            <DashboardCard title="Widgets" value={widgetsCount} icon={ToyBrick} href="/admin/widgets" />
            <DashboardCard title="Header Links" value={headerMenu.links.length} icon={MenuIcon} href="/admin/menus" />
            <DashboardCard title="Footer Links" value={footerMenu.links.length} icon={MenuIcon} href="/admin/menus" />
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <RecentPages pages={Array.isArray(recentPages) ? recentPages : []} />
            <RecentPosts posts={Array.isArray(recentPosts) ? recentPosts : []} />
            <NewUsers users={Array.isArray(recentUsers) ? recentUsers : []} />
            <RecentSubmissions contacts={Array.isArray(recentContacts) ? recentContacts : []} />
        </div>
    </div>
  );
}
