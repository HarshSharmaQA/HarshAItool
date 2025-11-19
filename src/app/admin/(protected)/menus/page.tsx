
import { getMenu } from "@/lib/data";
import MenuForm from "./menu-form";

export const metadata = {
  title: "Manage Menus",
};

export default async function MenusAdminPage() {
  const headerMenu = await getMenu("header");
  const footerMenu = await getMenu("footer");

  return (
    <div className="space-y-8">
      <MenuForm menu={headerMenu} />
      <MenuForm menu={footerMenu} />
    </div>
  );
}
