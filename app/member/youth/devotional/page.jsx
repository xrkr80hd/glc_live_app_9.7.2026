import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { YouthGlassCard } from "@/components/app-shell/YouthGlassCard";
import { youthDevotionalPlaceholders } from "@/lib/mobile-app-content";

export default function YouthDevotionalPage() {
  return (
    <AppShell
      navKey="more"
      theme="youth"
      title="Youth Devotional"
      subtitle="A focused devotional reading experience for youth ministry."
    >
      <BackRow fallbackHref="/member/youth" useHistory={false} />

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>{youthDevotionalPlaceholders.title}</h2>
          <p className="lc-muted">{youthDevotionalPlaceholders.reference}</p>
        </div>
        <div className="lc-rich-copy">
          <blockquote>{youthDevotionalPlaceholders.passage}</blockquote>
          <p>{youthDevotionalPlaceholders.text}</p>
        </div>
      </YouthGlassCard>
    </AppShell>
  );
}
