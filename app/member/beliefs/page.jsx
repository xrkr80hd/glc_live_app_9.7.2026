import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { memberBeliefGroups } from "@/lib/member-page-data";
import { IconBible, IconChevronDown } from "@tabler/icons-react";

export default function BeliefsPage() {
  return (
    <AppShell navKey="more" title="Beliefs" subtitle="A clear summary of Liberty Church beliefs, matched to the main site.">
      <BackRow fallbackHref="/member/more" />

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconBible size={16} stroke={1.8} />
          <span>These sections mirror the teaching emphasis and structure of the Liberty Church beliefs page.</span>
        </div>
      </section>

      <section className="lc-stack">
        {memberBeliefGroups.map((group, index) => (
          <details key={group.id} className="lc-belief-group" open={index === 0}>
            <summary className="lc-belief-group-toggle">
              <span>{group.title}</span>
              <IconChevronDown size={18} stroke={1.9} aria-hidden="true" />
            </summary>
            <div className="lc-belief-group-panel">
              <div className="lc-stack">
                {group.items.map((item) => (
                  <article key={item.id} className="lc-card">
                    <div className="lc-section-head">
                      <h2>{item.title}</h2>
                      <p className="lc-muted">{item.summary}</p>
                    </div>
                    <div className="lc-rich-copy">
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </details>
        ))}
      </section>
    </AppShell>
  );
}
