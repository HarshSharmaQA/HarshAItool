
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Loader2, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Page } from "@/lib/types";
import { deletePage } from "@/app/actions/page-actions";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

function DeletePageButton({ id, slug, asChild = false }: { id: string, slug: string, asChild?: boolean }) {
    const { user } = useUser();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deletePage(idToken, id, slug);
            if (result.error) {
                toast({ variant: "destructive", title: "Error", description: result.error });
            } else {
                toast({ title: "Success", description: result.success });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
      <AlertDialog>
        {asChild ? (
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
        ) : (
          <AlertDialogTrigger asChild={false}>
            <button className="w-full text-left text-destructive relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              Delete
            </button>
          </AlertDialogTrigger>
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page.
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

export default function PagesPage() {
  const pagesQuery = db ? query(collection(db, 'pages'), orderBy('updatedAt', 'desc')) : null;
  const { data: pages, loading } = useCollection<Page>(pagesQuery);

  const downloadCSV = () => {
    if (!pages) return;

    const escapeCSV = (str: any): string => {
        if (str === null || str === undefined) return '""';
        const value = Array.isArray(str) ? str.join(', ') : String(str);
        return `"${value.replace(/"/g, '""')}"`;
    }

    const headers = "Title,URL Slug,Status,Created At,Last Updated,SEO Title,SEO Description,SEO Keywords\n";
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers
      + pages.map(p => 
          [
            escapeCSV(p.title),
            escapeCSV(p.urlSlug),
            escapeCSV(p.status),
            `"${p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
            `"${p.updatedAt ? format(new Date(p.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
            escapeCSV(p.seoTitle),
            escapeCSV(p.seoDescription),
            escapeCSV(p.seoKeywords),
          ].join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <Button onClick={downloadCSV} size="sm" variant="outline" disabled={!pages || pages.length === 0}>
                <Download className="h-4 w-4 mr-2"/>Export CSV
            </Button>
            <Button asChild size="sm">
                <Link href="/admin/pages/new"><PlusCircle className="h-4 w-4 mr-2"/>New Page</Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>A list of all pages on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : pages && pages.length > 0 ? (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                     <TableCell>
                      <Badge variant={page.status === 'public' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">/{page.urlSlug}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {page.createdAt ? format(new Date(page.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {page.updatedAt ? format(new Date(page.updatedAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                              <a href={`/${page.urlSlug === 'home' ? '' : page.urlSlug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                          </Button>
                           <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/pages/edit/${page.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                           <DeletePageButton id={page.id} slug={page.urlSlug} asChild={true} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pages found.
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
