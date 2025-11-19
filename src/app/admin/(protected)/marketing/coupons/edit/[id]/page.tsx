
import CouponForm from "../../(form)/coupon-form";
import { getCoupon } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Coupon",
};

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const couponData = await getCoupon(awaitedParams.id);

  if (!couponData) {
    notFound();
  }
  
  const coupon = convertTimestamps(couponData);

  return <CouponForm coupon={coupon} />;
}
