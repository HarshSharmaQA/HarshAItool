
import { getBlockSettings } from "@/lib/data";
import BlockSettingsForm from "./block-settings-form";

export const metadata = {
  title: "Block Settings",
};

export default async function BlockSettingsPage() {
  const settings = await getBlockSettings();

  return <BlockSettingsForm settings={settings} />;
}
