
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
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { deleteWidget } from "@/app/actions/widget-actions";
import type { Widget } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

function DeleteWidgetButton({ id }: { id: string }) {
    const { user } = useUser();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deleteWidget(idToken, id);
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

function ShortcodeDisplay({ slug }: { slug: string }) {
    const { toast } = useToast();
    const shortcode = `[widget slug="${slug}"]`;
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(shortcode);
      toast({ title: "Copied!", description: "Shortcode copied to clipboard." });
    };
  
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              readOnly
              value={shortcode}
              className="bg-muted border-dashed cursor-pointer text-xs"
              onClick={copyToClipboard}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy shortcode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

export default function WidgetsAdminPage() {
  const widgetsQuery = db ? query(collection(db, 'widgets'), orderBy('createdAt', 'desc')) : null;
  const { data: widgets, loading } = useCollection<Widget>(widgetsQuery);

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div></div>
            <Button asChild size="sm">
                <Link href="/admin/widgets/new"><PlusCircle className="h-4 w-4 mr-2"/>New Widget</Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Widgets</CardTitle>
          <CardDescription>Manage reusable content widgets for your site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Shortcode</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : widgets && widgets.length > 0 ? (
                widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell className="font-medium">
                        {widget.title}
                    </TableCell>
                    <TableCell>
                        <ShortcodeDisplay slug={widget.slug} />
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
                            <Link href={`/admin/widgets/edit/${widget.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteWidgetButton id={widget.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No widgets found.
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
