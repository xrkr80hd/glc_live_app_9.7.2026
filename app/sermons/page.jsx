import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";
import { SermonsClient } from "@/components/SermonsClient";
import { getSermonsContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SermonsPage() {
  const { videos } = await getSermonsContent();

  return (
    <>
      <ChurchHeader active="sermons" />

      <main>
        <SermonsClient videos={videos} />
      </main>

      <ChurchSiteFooter />
    </>
  );
}
