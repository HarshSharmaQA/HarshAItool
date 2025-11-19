
import WidgetForm from "../../(form)/widget-form";
import { getWidget } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Widget",
};

export default async function EditWidgetPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const widgetData = await getWidget(awaitedParams.id);

  if (!widgetData) {
    notFound();
  }
  
  const widget = convertTimestamps(widgetData);

  return <WidgetForm widget={widget} />;
}
