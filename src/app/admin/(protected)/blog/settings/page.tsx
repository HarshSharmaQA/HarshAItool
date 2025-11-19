
import { getBlogSettings, getPosts } from "@/lib/data";
import BlogSettingsForm from "./blog-settings-form";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const settings = await getBlogSettings();
  const allPosts = await getPosts('all');

  return <BlogSettingsForm settings={settings} posts={allPosts} />;
}
