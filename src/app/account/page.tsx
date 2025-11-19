
import { ClientProviders } from "@/components/providers/client-providers";
import ProtectedRoute from "@/components/auth/protected-route";
import AccountClientPage from "./account-client";
import { getSettings } from "@/lib/data";

export const metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const settings = await getSettings();

  return (
    <ClientProviders settings={settings}>
      <ProtectedRoute>
        <AccountClientPage settings={settings} />
      </ProtectedRoute>
    </ClientProviders>
  );
}
