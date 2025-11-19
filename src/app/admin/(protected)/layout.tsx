
import { getSettings, getAdminMenu } from "@/lib/data";
import ProtectedContent from "./protected-content";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const adminMenu = await getAdminMenu();

  return (
    <ProtectedContent settings={settings} adminMenu={adminMenu}>
        {children}
    </ProtectedContent>
  );
}
