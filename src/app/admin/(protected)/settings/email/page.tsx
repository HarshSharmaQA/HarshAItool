
import { getEmailTemplates } from "@/lib/data";
import EmailTemplatesForm from "./email-templates-form";

export const metadata = {
  title: "Email Templates",
};

export default async function EmailSettingsPage() {
  const templates = await getEmailTemplates();

  return <EmailTemplatesForm templates={templates} />;
}
