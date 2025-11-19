
import PageForm from "../../(form)/page-form";
import { getPage } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Page",
};

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const pageData = await getPage(awaitedParams.id);

  if (!pageData) {
    notFound();
  }
  
  const page = convertTimestamps(pageData);

  return <PageForm page={page} />;
}
