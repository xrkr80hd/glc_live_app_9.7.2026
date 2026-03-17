import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { memberBeliefGroups } from "@/lib/member-page-data";
import { IconChevronDown } from "@tabler/icons-react";

export default function BeliefsPage() {
  return (
    <AppShell navKey="more" title="Beliefs" subtitle="Read our core beliefs.">
      <BackRow fallbackHref="/member/more" />

      <section className="lc-card alt lc-beliefs-intro-card">
        <div className="lc-announcement-meta">
          <span>Open each section to read belief summaries and full details.</span>
        </div>
      </section>

      <section className="lc-stack">
        {memberBeliefGroups.map((group, index) => (
          <details key={group.id} className="lc-belief-group lc-belief-group-soft" open={index === 0}>
            <summary className="lc-belief-group-toggle">
              <span>{group.title}</span>
              <IconChevronDown size={18} stroke={1.9} aria-hidden="true" />
            </summary>
            <div className="lc-belief-group-panel">
              <div className="lc-stack">
                {group.items.map((item) => (
                  <article key={item.id} className="lc-card lc-belief-item-card">
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
