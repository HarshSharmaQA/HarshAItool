
import UserForm from "../../(form)/user-form";
import { getUser } from "@/lib/data";
import { notFound } from "next/navigation";
import { convertTimestamps } from "@/lib/utils";

export const metadata = {
  title: "Edit User",
};

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const userData = await getUser(awaitedParams.id);

  if (!userData) {
    notFound();
  }
  
  const user = convertTimestamps(userData);

  return <UserForm user={user} />;
}
