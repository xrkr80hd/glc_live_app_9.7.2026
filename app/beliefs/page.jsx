import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { beliefCards } from "@/lib/mobile-app-content";
import { IconBible } from "@tabler/icons-react";

export default function BeliefsPage() {
  return (
    <AppShell navKey="more" title="Beliefs" subtitle="Read-only overview of Liberty Church beliefs.">
      <BackRow fallbackHref="/more" />

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconBible size={16} stroke={1.8} />
          <span>Core beliefs are grouped in clear, readable sections.</span>
        </div>
      </section>

      <section className="lc-stack">
        {beliefCards.map((item) => (
          <article key={item.id} className="lc-card">
            <div className="lc-section-head">
              <h2>{item.title}</h2>
              <p className="lc-muted">{item.summary}</p>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
