
"use client";

import Link from "next/link";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { useUser } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle, Loader2, Download, Eye, Edit, Trash2 } from "lucide-react";
import { deleteBlog } from "@/app/actions/blog-actions";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function DeleteBlogButton({ id, slug, asChild = false }: { id: string, slug: string, asChild?: boolean }) {
    const { user } = useUser();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deleteBlog(idToken, id, slug);
            if (result.error) {
                toast({ variant: "destructive", title: "Error", description: result.error });
            } else {
                toast({ title: "Success", description: result.success });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };
    
    if (asChild) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }
    
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild={false}>
                <button className="w-full text-left text-destructive relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Delete
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the blog post.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function BlogAdminPage() {
  const postsQuery = db ? query(collection(db, 'posts'), orderBy('updatedAt', 'desc')) : null;
  const { data: posts, loading } = useCollection<Post>(postsQuery);

  const downloadCSV = () => {
    if (!posts) return;

    const escapeCSV = (str: any): string => {
        if (str === null || str === undefined) return '""';
        const value = Array.isArray(str) ? str.join(', ') : String(str);
        return `"${value.replace(/"/g, '""')}"`;
    }

    const headers = "Title,URL Slug,Status,Author,Categories,Published At,Last Updated,SEO Title,SEO Description,SEO Keywords\n";
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers
      + posts.map(p => 
          [
            escapeCSV(p.title),
            escapeCSV(p.urlSlug),
            escapeCSV(p.status),
            escapeCSV(p.author),
            escapeCSV(p.categories),
            `"${p.publishedAt ? format(new Date(p.publishedAt), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
            `"${p.updatedAt ? format(new Date(p.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
            escapeCSV(p.seoTitle),
            escapeCSV(p.seoDescription),
            escapeCSV(p.seoKeywords),
          ].join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "blog-posts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <Button onClick={downloadCSV} size="sm" variant="outline" disabled={!posts || posts.length === 0}>
                <Download className="h-4 w-4 mr-2"/>Export CSV
            </Button>
            <Button asChild size="sm">
                <Link href="/admin/blog/new"><PlusCircle className="h-4 w-4 mr-2"/>New Post</Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>A list of all blog posts on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                        <Badge variant={post.status === 'public' ? 'default' : 'secondary'}>
                            {post.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary">{post.author}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {post.updatedAt ? format(new Date(post.updatedAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" asChild>
                              <a href={`/blog/${post.urlSlug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                          </Button>
                           <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/blog/edit/${post.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <DeleteBlogButton id={post.id} slug={post.urlSlug} asChild={true} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
