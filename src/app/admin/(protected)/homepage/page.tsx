
import { getHomePage } from "@/lib/data";
import HomePageForm from "./homepage-form";

export const metadata = {
  title: "Manage Homepage",
};

export default async function HomepageAdminPage() {
  const homePage = await getHomePage();

  return (
    <div className="space-y-8">
      <HomePageForm homePage={homePage} />
    </div>
  );
}
