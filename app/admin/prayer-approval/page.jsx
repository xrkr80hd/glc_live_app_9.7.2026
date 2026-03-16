import { redirect } from "next/navigation";
import { BackRow } from "@/components/app-shell/BackRow";
import { adminPrayerRequests } from "@/lib/mobile-app-content";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { getMemberRoleKeys, hasAnyRole } from "@/lib/admin-role-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { IconCheck, IconShieldCheck, IconTrash } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

const allowedRoleKeys = ["admin", "moderator", "pastor", "superuser"];

export default async function AdminPrayerApprovalPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  let roleKeys = [];
  if (session.memberId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      roleKeys = await getMemberRoleKeys(supabase, session.memberId);
    }
  }

  const effectiveRoleKeys = session.isSuperuser ? [...roleKeys, "superuser"] : roleKeys;
  const isAuthorized = session.source === "env" || Boolean(session.isSuperuser) || hasAnyRole(effectiveRoleKeys, allowedRoleKeys);

  if (!isAuthorized) {
    redirect("/admin");
  }

  return (
    <main className="admin-layout-wrap">
      <div className="container stack-lg">
        <BackRow fallbackHref="/admin" useHistory={false} meta={`Signed in as ${session.username}`} />

        <section className="card stack-lg">
          <div className="lc-announcement-meta">
            <IconShieldCheck size={18} stroke={1.8} />
            <span>Restricted moderator route for prayer wall approval.</span>
          </div>
          <div className="lc-section-head">
            <h1>Prayer Wall Approval</h1>
            <p className="muted-text">Approve or reject pending prayer requests before they are visible on the member Prayer Wall.</p>
          </div>
        </section>

        <section className="cards">
          {adminPrayerRequests.map((request) => (
            <article key={request.id} className="card stack-lg">
              <div className="lc-announcement-meta">
                <span>{request.submittedAt}</span>
                <span>{request.destination}</span>
              </div>
              <div className="lc-stack">
                <strong>{request.anonymous ? "Anonymous submission" : request.submittedBy}</strong>
                <p>{request.request}</p>
              </div>
              <div className="lc-button-row">
                <button type="button" className="lc-action-btn primary">
                  <IconCheck size={18} stroke={1.8} />
                  <span>Approve</span>
                </button>
                <button type="button" className="lc-action-btn ghost">
                  <IconTrash size={18} stroke={1.8} />
                  <span>Delete / Reject</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}