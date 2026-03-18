import { getDashboardViewerContext } from "@/lib/role-dashboard-config";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage() {
  const viewer = await getDashboardViewerContext();

  if (!viewer) {
    redirect("/member-access");
  }

  redirect(viewer.primaryDashboardPath);
}
