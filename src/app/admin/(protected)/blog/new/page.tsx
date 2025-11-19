import { getPosts } from "@/lib/data";
import PostForm from "../(form)/post-form";

export const metadata = {
  title: "New Post",
};

export default async function NewPostPage() {
  const allPosts = await getPosts('all');
  return <PostForm allPosts={allPosts} />;
}
