import { getDashboardViewerContext } from "@/lib/role-dashboard-config";
import { redirect } from "next/navigation";
import { DashboardHubPage } from "@/components/dashboard/DashboardHubPage";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage() {
  const viewer = await getDashboardViewerContext();

  if (!viewer) {
    redirect("/member-access");
  }

  return <DashboardHubPage viewer={viewer} />;
}
