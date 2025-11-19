
import { redirect } from 'next/navigation';

export default function SettingsAdminPage() {
  // Redirect to the new global settings page by default.
  redirect('/admin/settings/global');
}
