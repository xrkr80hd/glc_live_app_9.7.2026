import { redirect } from "next/navigation";
import { MediaReadinessSetupClient } from "@/components/admin/MediaReadinessSetupClient";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function MediaReadinessAdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  return <MediaReadinessSetupClient />;
}
