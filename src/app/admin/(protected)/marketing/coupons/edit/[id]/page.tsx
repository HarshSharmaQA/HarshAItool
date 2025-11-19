
import CouponForm from "../../(form)/coupon-form";
import { getCoupon } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Coupon",
};

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const couponData = await getCoupon(params.id);

  if (!couponData) {
    notFound();
  }
  
  const coupon = convertTimestamps(couponData);

  return <CouponForm coupon={coupon} />;
}
