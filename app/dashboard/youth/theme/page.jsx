import { RoleDashboardRoute } from "@/components/dashboard/RoleDashboardRoute";

export const dynamic = "force-dynamic";

export default async function YouthThemeDashboardPage() {
  return <RoleDashboardRoute dashboardKey="youthTheme" />;
}
