import { RoleDashboardPage } from "@/components/dashboard/RoleDashboardPage";
import { canAccessDashboard, getDashboardConfigByKey, getDashboardConfigBySlug, getDashboardViewerContext } from "@/lib/role-dashboard-config";
import { notFound, redirect } from "next/navigation";

export async function RoleDashboardRoute({ dashboardKey = null, dashboardSlug = null }) {
  const config = dashboardKey ? getDashboardConfigByKey(dashboardKey) : getDashboardConfigBySlug(dashboardSlug);

  if (!config) {
    notFound();
  }

  const viewer = await getDashboardViewerContext();
  if (!viewer) {
    redirect("/member-access");
  }

  if (!canAccessDashboard(config, viewer.roleKeys, viewer.isSuperuser)) {
    redirect(viewer.primaryDashboardPath);
  }

  return <RoleDashboardPage config={config} viewer={viewer} />;
}
