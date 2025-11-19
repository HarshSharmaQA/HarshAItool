
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Loader2, ExternalLink } from "lucide-react";
import { deleteRedirect } from "@/app/actions/redirect-actions";
import { Badge } from "@/components/ui/badge";
import type { Redirect } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function DeleteRedirectButton({ id }: { id: string }) {
    const { user } = useUser();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deleteRedirect(idToken, id);
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
        <button onClick={handleDelete} className="w-full text-left text-destructive relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            Delete
        </button>
    );
}

export default function RedirectsAdminPage() {
  const redirectsQuery = db ? query(collection(db, 'redirects')) : null;
  const { data: redirects, loading } = useCollection<Redirect>(redirectsQuery);

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div></div>
            <Button asChild size="sm">
                <Link href="/admin/redirects/new"><PlusCircle className="h-4 w-4 mr-2"/>New Redirect</Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>URL Redirects</CardTitle>
          <CardDescription>Manage all URL redirects for your site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Path</TableHead>
                <TableHead>Destination Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Behavior</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : redirects && redirects.length > 0 ? (
                redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-medium">
                        <Badge variant="outline">{redirect.source}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{redirect.destination}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={redirect.type === '301' ? 'default' : 'secondary'}>
                            {redirect.type === '301' ? 'Permanent' : 'Temporary'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      {redirect.openInNewTab && (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <ExternalLink className="h-3 w-3" /> New Tab
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/redirects/edit/${redirect.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteRedirectButton id={redirect.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No redirects found.
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
