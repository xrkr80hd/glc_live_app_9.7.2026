import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberSermonsScreen } from "@/components/app-shell/MemberSermonsScreen";
import { getSermonsContent } from "@/lib/content";

export default async function SermonsPage() {
  const { videos } = await getSermonsContent();

  return (
    <AppShell navKey="sermons" title="Sermons" subtitle="Browse recent messages, series, and featured teachings.">
      <BackRow fallbackHref="/member" />
      <MemberSermonsScreen videos={videos} />
    </AppShell>
  );
}
