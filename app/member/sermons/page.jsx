import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberSermonsScreen } from "@/components/app-shell/MemberSermonsScreen";
import { getSermonsContent } from "@/lib/content";

export default async function SermonsPage() {
  const { videos } = await getSermonsContent();

  return (
    <AppShell navKey="more" title="Sermons" subtitle="Watch recent messages and series.">
      <BackRow fallbackHref="/member/more" />
      <MemberSermonsScreen videos={videos} />
    </AppShell>
  );
}
