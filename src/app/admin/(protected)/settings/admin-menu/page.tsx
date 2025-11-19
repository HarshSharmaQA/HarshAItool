
import { getAdminMenu } from "@/lib/data";
import AdminMenuForm from "./admin-menu-form";

export const metadata = {
  title: "Admin Menu Settings",
};

export default async function AdminMenuSettingsPage() {
  const menuItems = await getAdminMenu();
  return <AdminMenuForm menuItems={menuItems} />;
}
