import { RoleDashboardRoute } from "@/components/dashboard/RoleDashboardRoute";

export const dynamic = "force-dynamic";

export default async function DashboardRolePage({ params }) {
  const resolvedParams = await params;
  return <RoleDashboardRoute dashboardSlug={resolvedParams.dashboard} />;
}
