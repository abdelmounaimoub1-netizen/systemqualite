import { ProfilePageClient } from "@/components/settings/profile-page-client";
import { getProfilePageData } from "@/lib/modules/queries";

export default async function ProfilePage() {
  const { context, lookups } = await getProfilePageData();
  return <ProfilePageClient context={context} lookups={lookups} />;
}
