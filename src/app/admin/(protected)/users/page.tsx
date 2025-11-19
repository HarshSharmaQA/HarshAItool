
"use client";

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { useUser } from "@/components/providers/app-providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, ShieldCheck, Shield, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { deleteUser, approveUser } from "@/app/actions/user-actions";
import { MASTER_ADMIN_EMAIL } from "@/lib/auth-constants";
import { Badge } from "@/components/ui/badge";
import RoleSwitcher from "./role-switcher";
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
  
const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function DeleteUserButton({ uid }: { uid: string }) {
    const { user } = useUser();
    const { toast } = useToast();
    
    const handleDelete = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const result = await deleteUser(idToken, uid);
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
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
        </button>
    );
}

function ApproveUserButton({ uid }: { uid: string }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
      if (!user) {
          toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
          return;
      }
      setIsApproving(true);
      try {
          const idToken = await user.getIdToken();
          const result = await approveUser(idToken, uid);
          if (result.error) {
              toast({ variant: "destructive", title: "Error", description: result.error });
          } else {
              toast({ title: "Success", description: result.success });
          }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
          setIsApproving(false);
      }
  };

  return (
      <Button onClick={handleApprove} variant="outline" size="sm" disabled={isApproving}>
          {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Approve
      </Button>
  );
}
  
export default function UsersAdminPage() {
    const { user: currentUser } = useUser();
    const usersQuery = db ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null;
    const { data: users, loading } = useCollection<UserProfile>(usersQuery);

    return (
      <>
        <Card>
            <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>A list of all registered users on your website. User accounts are created automatically on their first sign-in.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
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
                ) : users && users.length > 0 ? (
                    users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={(user.photoURL as string) || undefined} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <span>{user.displayName || 'No Name'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {user.email}
                        </TableCell>
                        <TableCell>
                           {user.email === MASTER_ADMIN_EMAIL ? (
                             <Badge>
                               <ShieldCheck className="mr-2 h-4 w-4" />
                               Admin
                             </Badge>
                           ) : currentUser ? (
                             <RoleSwitcher uid={user.uid} currentRole={user.role || 'user'} />
                           ) : (
                            <Badge variant="secondary">
                              <Shield className="mr-2 h-4 w-4" />
                              {user.role || 'user'}
                            </Badge>
                           )}
                        </TableCell>
                        <TableCell>
                            {user.approved ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>
                            ) : (
                                <ApproveUserButton uid={user.uid} />
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.uid === currentUser?.uid}>
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/users/edit/${user.uid}`}>Edit Profile</Link>
                                    </DropdownMenuItem>
                                    {user.email !== MASTER_ADMIN_EMAIL && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DeleteUserButton uid={user.uid} />
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
      </Card>
      </>
    );
}
