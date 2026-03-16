import { redirect } from "next/navigation";
import { BackRow } from "@/components/app-shell/BackRow";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { IconBug, IconMail, IconMapPin, IconUser } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminTestFeedbackPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  const supabase = createSupabaseAdminClient();
  let feedbackItems = [];

  if (supabase) {
    const { data } = await supabase
      .from("member_feedback")
      .select("id, name, email, route, category, severity, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    feedbackItems = Array.isArray(data) ? data : [];
  }

  return (
    <main className="admin-layout-wrap">
      <div className="container stack-lg">
        <BackRow fallbackHref="/admin" useHistory={false} meta={`Signed in as ${session.username}`} />

        <section className="card stack-lg">
          <div className="lc-announcement-meta">
            <IconBug size={18} stroke={1.8} />
            <span>Tester feedback inbox for the member build.</span>
          </div>
          <div className="lc-section-head">
            <h1>Test Feedback</h1>
            <p className="muted-text">Review bug reports, UI notes, and improvement ideas from the `/member/feedback` screen.</p>
          </div>
        </section>

        {feedbackItems.length ? (
          <section className="cards">
            {feedbackItems.map((item) => (
              <article key={item.id} className="card stack-lg">
                <div className="lc-card-list">
                  <span className="admin-badge">{item.category || "bug"}</span>
                  <span className={`admin-badge${item.severity === "high" ? " success" : ""}`}>{item.severity || "medium"}</span>
                  <span className="muted-text">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <p className="admin-cell-copy">{item.message}</p>
                <div className="stack-lg">
                  {item.route ? (
                    <div className="lc-announcement-meta">
                      <IconMapPin size={16} stroke={1.8} />
                      <span>{item.route}</span>
                    </div>
                  ) : null}
                  {item.name ? (
                    <div className="lc-announcement-meta">
                      <IconUser size={16} stroke={1.8} />
                      <span>{item.name}</span>
                    </div>
                  ) : null}
                  {item.email ? (
                    <div className="lc-announcement-meta">
                      <IconMail size={16} stroke={1.8} />
                      <span>{item.email}</span>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="card">
            <p className="muted-text">No tester feedback has been submitted yet.</p>
          </section>
        )}
      </div>
    </main>
  );
}
