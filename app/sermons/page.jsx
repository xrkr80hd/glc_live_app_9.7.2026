import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { SermonsClient } from "@/components/SermonsClient";
import { getSermonsContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SermonsPage() {
  const { videos } = await getSermonsContent();

  return (
    <PublicSiteShell>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <SermonsClient videos={videos} />
        </div>
      </div>
    </PublicSiteShell>
  );
}
