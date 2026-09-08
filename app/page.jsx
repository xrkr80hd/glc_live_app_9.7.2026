import { HomeAnnouncementsCarousel } from "@/components/public-site/HomeAnnouncementsCarousel";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { HomeRuntime } from "@/components/HomeRuntime";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomepageContent, getSocialLinksContent } from "@/lib/content";
import Link from "next/link";

export const dynamic = "force-dynamic";

const HERO_FALLBACK_VIDEO_URL = "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4";

function pickHeroVideoUrl(highlightCards) {
  if (!Array.isArray(highlightCards) || !highlightCards.length) {
    return HERO_FALLBACK_VIDEO_URL;
  }

  const heroVideo = highlightCards.find((item) => {
    const mediaType = String(item?.media_type || "").trim().toLowerCase();
    const mediaUrl = String(item?.media_url || "").trim();
    const isVideoType = mediaType === "video";
    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl);
    return isVideoType && isDirectVideo;
  });

  return String(heroVideo?.media_url || "").trim() || HERO_FALLBACK_VIDEO_URL;
}

function formatAnnouncementDate(announcement) {
  const raw = announcement?.startsAt || announcement?.createdAt || "";
  if (!raw) {
    return "This week";
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "This week";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAnnouncementImage(announcement) {
  const imageUrl = String(announcement?.imageUrl || announcement?.image_url || "").trim();
  const imageAltRaw = String(announcement?.imageAlt || announcement?.image_alt || "").trim();
  const title = String(announcement?.title || "").trim();
  return {
    imageUrl,
    imageAlt: imageAltRaw || (title ? `${title} announcement image` : "Announcement image"),
  };
}

export default async function HomePage() {
  const [{ announcements, ministries, highlightCards }, socialLinks] = await Promise.all([
    getHomepageContent(),
    getSocialLinksContent(),
  ]);
  const announcementPreview = announcements.slice(0, 6).map((announcement) => {
    const { imageUrl, imageAlt } = getAnnouncementImage(announcement);

    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      dateLabel: formatAnnouncementDate(announcement),
      imageUrl,
      imageAlt,
    };
  });
  const ministryPreview = Array.isArray(ministries)
    ? ministries.filter((item) => String(item?.title || "").trim() || String(item?.body || "").trim())
    : [];
  const heroVideoUrl = pickHeroVideoUrl(highlightCards);

  return (
    <PublicSiteShell socialLinks={socialLinks}>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04}>
            <Card className="relative overflow-hidden border border-[#E3E8E6] bg-white py-0 shadow-sm">
              <video
                id="heroVideo"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-[0.52]"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[#3F4D48]/35" aria-hidden="true" />
              <CardHeader className="relative z-10 px-5 pb-2 pt-6 sm:px-8 sm:pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Welcome Home</p>
                <CardTitle className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Jesus-centered. Spirit-led.
                  <br />
                  Family-minded.
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 px-5 pb-7 pt-2 sm:px-8 sm:pb-8">
                <div className="w-fit border-l-4 border-[#2E7D32] bg-black/30 px-4 py-3 text-white backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Sunday Services</p>
                  <p className="mt-1 text-sm font-semibold sm:text-base">9:20 AM – Youth Devotion</p>
                  <p className="text-sm font-semibold sm:text-base">10:00 AM – Worship Service</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="h-10 w-full rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold text-white hover:bg-[#2E7D32] sm:w-auto">
                    <Link href="/visit">Plan Your Visit</Link>
                  </Button>
                  <Button asChild variant="secondary" className="h-10 w-full rounded-none px-4 text-sm font-semibold sm:w-auto">
                    <Link href="/sermons">Watch Sermons</Link>
                  </Button>
                </div>

                <button
                  id="reopenWelcome"
                  type="button"
                  className="inline-flex min-h-10 w-full items-center justify-center border border-white/45 bg-transparent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                >
                  A welcome message from Pastor Andrew Stokes
                </button>

                <div className="inline-flex max-w-full items-center rounded-none border border-[#E3E8E6] bg-white px-3 py-2 text-sm text-[#3F4D48]">100 McKeithen Dr, Alexandria, LA 71303</div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade inView delay={0.08} className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-[#3F4D48] sm:text-3xl">Our Ministries and Service Times</h2>
              <div className="h-1 w-16 bg-[#2E7D32]" />
              <p className="pt-1 text-sm text-[#3F4D48] sm:text-base">Below are our ministry highlights and service times; see announcements for updates.</p>
            </div>
            <div className="space-y-2.5">
              {ministryPreview.length ? (
                ministryPreview.map((item) => (
                  <article key={item.id} className="border border-[#E3E8E6] bg-white px-3.5 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="text-base font-semibold leading-tight text-[#2E7D32] sm:text-lg">{item.title}</h3>
                        <p className="text-sm leading-6 text-[#3F4D48] sm:text-[15px] sm:leading-6">
                          <span aria-hidden="true">- </span>
                          {item.body}
                        </p>
                      </div>
                      {String(item?.imageUrl || item?.image_url || "").trim() ? (
                        <div className="relative hidden w-24 shrink-0 overflow-hidden border border-[#E3E8E6] bg-[#EEF1ED] sm:block" style={{ aspectRatio: "4 / 3" }}>
                          <img
                            src={String(item.imageUrl || item.image_url || "").trim()}
                            alt={String(item.imageAlt || item.image_alt || item.title || "Ministry image").trim()}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                    {String(item?.imageUrl || item?.image_url || "").trim() ? (
                      <div className="relative mt-3 overflow-hidden border border-[#E3E8E6] bg-[#EEF1ED] sm:hidden" style={{ aspectRatio: "4 / 3" }}>
                        <img
                          src={String(item.imageUrl || item.image_url || "").trim()}
                          alt={String(item.imageAlt || item.image_alt || item.title || "Ministry image").trim()}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <article className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-base leading-7 text-[#3F4D48]">Ministry highlights will appear here as they are added in admin.</p>
                </article>
              )}
            </div>
          </BlurFade>

          <BlurFade inView delay={0.12} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Church Announcements</p>
              <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">What&apos;s Happening At Liberty</h2>
              <p className="text-base text-[#3F4D48]">Current church updates, presented in a clean weekly flow.</p>
            </div>
            <HomeAnnouncementsCarousel announcements={announcementPreview} />
          </BlurFade>

          <BlurFade inView delay={0.14} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Meet Our Pastor</p>
              <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">Pastor Andrew Stokes</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-[380px_1fr] md:gap-6">
              <article className="mx-auto w-full max-w-[380px] overflow-hidden border border-[#E3E8E6] bg-white md:mx-0 md:max-w-none">
                <img
                  src="https://www.golibertychurch.com/assets/Pastor%26Fam.jpg"
                  alt="Pastor Andrew Stokes and family"
                  className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full md:min-h-[420px]"
                />
              </article>
              <article className="flex h-full items-center border border-[#E3E8E6] bg-white p-5 sm:p-6">
                <p className="text-[17px] leading-8 text-[#3F4D48] sm:text-lg sm:leading-8">
                  Pastor Andrew Stokes has led our church family since October 2013. He and his wife, Erin, our worship leader, serve side by side with their daughters,
                  Ellington and Emery, who are active in media and worship. Though both Andrew and Erin are bi-vocational, their hearts are fully committed to the church
                  God has entrusted to their care. They long for Liberty Church to be a place where everyone can approach the throne of God freely and give Him the praise
                  He deserves. Pastor Andrew teaches the Word with the guidance of the Holy Spirit, encouraging every person, member and guest alike, to pursue Christ
                  wholeheartedly, just as He passionately pursues us.
                </p>
              </article>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.16}>
            <Card className="border border-[#E3E8E6] bg-white py-0 shadow-sm">
              <CardHeader className="px-5 pb-2 pt-6 sm:px-7 sm:pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Learn More</p>
                <CardTitle className="text-2xl text-[#3F4D48] sm:text-3xl">Discover Liberty Church</CardTitle>
                <CardDescription className="max-w-3xl text-base text-[#3F4D48]">
                  Explore what we believe, plan your visit, and see how your family can get involved right away.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 px-5 pb-6 pt-1 sm:px-7 sm:pb-7">
                <Button asChild className="h-10 rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold text-white hover:bg-[#2E7D32]">
                  <Link href="/beliefs">Learn More About Our Church</Link>
                </Button>
                <Button asChild variant="secondary" className="h-10 rounded-none px-4 text-sm font-semibold">
                  <Link href="/visit">Plan Your Visit</Link>
                </Button>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
      <HomeRuntime />
    </PublicSiteShell>
  );
}
