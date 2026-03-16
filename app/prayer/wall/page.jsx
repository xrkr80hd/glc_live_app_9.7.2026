import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { PrayerCard } from "@/components/app-shell/PrayerCard";
import { prayerWallCards } from "@/lib/mobile-app-content";
import { IconMessageCircleHeart } from "@tabler/icons-react";

export default function PrayerWallPage() {
  return (
    <AppShell navKey="prayer" title="Prayer Wall" subtitle="Approved public prayer requests only.">
      <BackRow fallbackHref="/prayer" />

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconMessageCircleHeart size={16} stroke={1.8} />
          <span>New public requests appear here after moderation review.</span>
        </div>
      </section>

      <section className="lc-stack">
        {prayerWallCards.map((item) => (
          <PrayerCard key={item.id} title={item.title} request={item.request} meta={item.meta} />
        ))}
      </section>

      <Link href="/prayer" className="lc-action-link primary">
        <span>Submit Prayer Request</span>
      </Link>
    </AppShell>
  );
}
