import Link from "next/link";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLivestreamContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const livestream = await getLivestreamContent();
  const fallbackVideo =
    livestream.fallbackVideoUrl ||
    process.env.NEXT_PUBLIC_FALLBACK_STREAM_VIDEO_URL ||
    "/assets/stream_fallback_loop/stream_fall_back_loop.mp4";

  return (
    <PublicSiteShell>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04}>
            <Card className="border border-[#E3E8E6] bg-white py-0 shadow-sm">
              <CardHeader className="px-5 pb-2 pt-6 sm:px-7 sm:pt-7">
                <CardTitle className="text-2xl text-[#3F4D48] sm:text-3xl">Live Stream</CardTitle>
                <CardDescription className="text-base text-[#3F4D48]">Join us Sundays at 10:00 AM.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-6 pt-1 sm:px-7 sm:pb-7">
                <div id="LS1" style={{ display: livestream.isLive ? "block" : "none" }}>
                  <div className="overflow-hidden border border-[#E3E8E6] bg-white">
                    {livestream.isLive && livestream.liveEmbedUrl ? (
                      <iframe
                        src={livestream.liveEmbedUrl}
                        title={livestream.title || "Live Stream"}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                </div>

                <div id="LS2" style={{ display: livestream.isLive ? "none" : "block" }}>
                  <div className="overflow-hidden border border-[#E3E8E6] bg-white">
                    <video className="aspect-video w-full object-cover" autoPlay muted loop playsInline>
                      <source src={fallbackVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className="pt-3 text-sm text-[#3F4D48]">We are not currently streaming live. Join us Sundays at 10:00 AM.</p>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade inView delay={0.08}>
            <Card className="border border-[#E3E8E6] bg-white py-0 shadow-sm">
              <CardHeader className="px-5 pb-2 pt-6 sm:px-7 sm:pt-7">
                <CardTitle className="text-2xl text-[#3F4D48] sm:text-3xl">Can&apos;t Make It Live?</CardTitle>
                <CardDescription className="text-base text-[#3F4D48]">Catch up on recent sermons and services.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 px-5 pb-6 pt-1 sm:px-7 sm:pb-7">
                <Button asChild className="h-10 rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold text-white hover:bg-[#2E7D32]">
                  <Link href="/sermons">Watch Sermons</Link>
                </Button>
                <Button asChild variant="secondary" className="h-10 rounded-none px-4 text-sm font-semibold">
                  <Link href="/prayer">Submit Prayer Request</Link>
                </Button>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </PublicSiteShell>
  );
}
