
'use client';

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
import { MoreHorizontal, PlusCircle, Loader2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Coupon } from "@/lib/types";
import DeleteCouponButton from "./delete-button";

export default function CouponsAdminPage() {
  const couponsQuery = db ? query(collection(db, 'coupons'), orderBy('code', 'asc')) : null;
  const { data: coupons, loading } = useCollection<Coupon>(couponsQuery);
  const { settings } = useUser();
  const currency = settings?.currency || '₹';

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div></div>
            <Button asChild size="sm">
                <Link href="/admin/marketing/coupons/new"><PlusCircle className="h-4 w-4 mr-2"/>New Coupon</Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Discount Coupons</CardTitle>
          <CardDescription>Manage discount coupons for your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
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
              ) : coupons && coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">
                        <Badge variant="outline">{coupon.code}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{coupon.type}</TableCell>
                    <TableCell>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${currency}${coupon.value}`}
                    </TableCell>
                    <TableCell>
                        <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                            {coupon.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                            <Link href={`/admin/marketing/coupons/edit/${coupon.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteCouponButton couponId={coupon.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No coupons found.
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
