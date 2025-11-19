import PostForm from "@/app/admin/(protected)/blog/(form)/post-form";
import { getPost, getPosts } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit Post",
};

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const postData = await getPost(awaitedParams.id);
  const allPosts = await getPosts('all');

  if (!postData) {
    notFound();
  }
  
  const post = convertTimestamps(postData);

  return <PostForm post={post} allPosts={allPosts} />;
}