
"use client";

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
import { Trash2, Loader2, Download } from "lucide-react";
import { deleteSubscriber } from "@/app/actions/subscriber-actions";
import type { Subscriber } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function DeleteSubscriberButton({ id }: { id: string }) {
    const { user } = useUser();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deleteSubscriber(idToken, id);
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
            <AlertDialogTrigger asChild>
                <button className="w-full text-left text-destructive relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Delete
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the subscriber. This action cannot be undone.
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

export default function SubscribersAdminPage() {
  const subscribersQuery = db ? query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc')) : null;
  const { data: subscribers, loading } = useCollection<Subscriber>(subscribersQuery);

  const downloadCSV = () => {
    if (!subscribers) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Subscribed At\n" 
      + subscribers.map(s => `"${s.name}","${s.email}","${s.subscribedAt ? format(new Date(s.subscribedAt), 'yyyy-MM-dd HH:mm:ss') : ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div></div>
            <Button onClick={downloadCSV} size="sm" disabled={!subscribers || subscribers.length === 0}>
                <Download className="h-4 w-4 mr-2"/>Export CSV
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers</CardTitle>
          <CardDescription>A list of all users subscribed to your newsletter.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : subscribers && subscribers.length > 0 ? (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.name}</TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.subscribedAt ? format(new Date(subscriber.subscribedAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                         <DeleteSubscriberButton id={subscriber.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No subscribers yet.
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
