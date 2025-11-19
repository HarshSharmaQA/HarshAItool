
import RedirectForm from "../../(form)/redirect-form";
import { getRedirect } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Redirect",
};

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const redirectData = await getRedirect(awaitedParams.id);

  if (!redirectData) {
    notFound();
  }
  
  const redirect = convertTimestamps(redirectData);

  return <RedirectForm redirect={redirect} />;
}
