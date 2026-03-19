import Link from "next/link";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomepageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const HERO_FALLBACK_VIDEO_URL = "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4";

const DAY_PATTERN = /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i;
const TIME_PATTERN = /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
const SERVICE_PATTERN = /\b(service|gathering|worship)\b/i;
const MIDWEEK_PATTERN = /\b(midweek|wednesday|weds)\b/i;

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

function splitHomepageMinistries(items) {
  if (!Array.isArray(items) || !items.length) {
    return {
      serviceTimes: [],
      ministries: [],
    };
  }

  const serviceTimes = [];
  const ministries = [];

  for (const item of items) {
    const title = String(item?.title || "").trim();
    const body = String(item?.body || "").trim();
    if (!title && !body) {
      continue;
    }

    const source = `${title} ${body}`.trim();
    const hasDay = DAY_PATTERN.test(source);
    const hasTime = TIME_PATTERN.test(source);
    const hasServiceLanguage = SERVICE_PATTERN.test(source);
    const hasMidweekLanguage = MIDWEEK_PATTERN.test(source);
    const isServiceTime = hasTime && (hasDay || hasServiceLanguage);

    if (hasMidweekLanguage) {
      continue;
    }

    if (isServiceTime) {
      serviceTimes.push({
        id: item.id,
        title: title || "Service",
        detail: body || "",
      });
      continue;
    }

    ministries.push({
      id: item.id,
      title: title || "Ministry",
      body,
    });
  }

  return {
    serviceTimes,
    ministries,
  };
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

export default async function HomePage() {
  const { announcements, ministries, highlightCards } = await getHomepageContent();
  const announcementPreview = announcements.slice(0, 6);
  const { serviceTimes: dynamicServiceTimes, ministries: dynamicMinistries } = splitHomepageMinistries(ministries);
  const serviceTimes = dynamicServiceTimes;
  const ministryPreview = dynamicMinistries.slice(0, 8);
  const heroVideoUrl = pickHeroVideoUrl(highlightCards);

  return (
    <PublicSiteShell>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04}>
            <Card className="relative overflow-hidden border border-[#E3E8E6] bg-white py-0 shadow-sm">
              <video
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
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="h-10 w-full rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold text-white hover:bg-[#2E7D32] sm:w-auto">
                    <Link href="/visit">Plan Your Visit</Link>
                  </Button>
                  <Button asChild variant="secondary" className="h-10 w-full rounded-none px-4 text-sm font-semibold sm:w-auto">
                    <Link href="/sermons">Watch Sermons</Link>
                  </Button>
                </div>
                <div className="inline-flex max-w-full items-center rounded-none border border-[#E3E8E6] bg-white px-3 py-2 text-sm text-[#3F4D48]">100 McKeithen Dr, Alexandria, LA 71303</div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade inView delay={0.08} className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Service Times</p>
              <h2 className="text-xl font-semibold text-[#3F4D48] sm:text-2xl">Join Us This Sunday</h2>
            </div>
            <div className="border border-[#E3E8E6] bg-white px-4 py-3 sm:px-5 sm:py-4">
              {serviceTimes.length ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                  {serviceTimes.map((item) => (
                    <p key={item.id} className="text-[15px] text-[#3F4D48]">
                      <span className="font-semibold">{item.title}</span>
                      {item.detail ? <span> - {item.detail}</span> : null}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-[#3F4D48]">Service times are updated from admin and will appear here once published.</p>
              )}
            </div>
            <p className="text-sm leading-6 text-[#3F4D48]">Older adults, families, and first-time guests are all welcome. You will be greeted and guided with care.</p>
          </BlurFade>

          <BlurFade inView delay={0.12} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Meet Our Pastor</p>
              <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">Pastor Andrew Stokes</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
              <article className="mx-auto w-full max-w-[240px] overflow-hidden border border-[#E3E8E6] bg-white md:mx-0 md:max-w-none">
                <img
                  src="https://www.golibertychurch.com/assets/Pastor%26Fam.jpg"
                  alt="Pastor Andrew Stokes and family"
                  className="aspect-square w-full object-cover md:aspect-auto md:h-full md:min-h-[250px]"
                />
              </article>
              <article className="border border-[#E3E8E6] bg-white p-4 sm:p-5">
                <p className="text-base leading-7 text-[#3F4D48]">
                  Pastor Andrew Stokes has led our church family since October 2013. He and his wife, Erin, our worship leader, serve side by side with their daughters,
                  Ellington and Emery, who are active in media and worship. Though both Andrew and Erin are bi-vocational, their hearts are fully committed to the church
                  God has entrusted to their care. They long for Liberty Church to be a place where everyone can approach the throne of God freely and give Him the praise
                  He deserves. Pastor Andrew teaches the Word with the guidance of the Holy Spirit, encouraging every person, member and guest alike, to pursue Christ
                  wholeheartedly, just as He passionately pursues us.
                </p>
              </article>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.14} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Church Announcements</p>
              <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">What&apos;s Happening At Liberty</h2>
              <p className="text-base text-[#3F4D48]">Current church updates, presented in a clean weekly flow.</p>
            </div>
            <div className="space-y-3">
              {announcementPreview.length ? (
                announcementPreview.map((announcement) => (
                  <article key={announcement.id} className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-4 sm:px-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2E7D32]">{formatAnnouncementDate(announcement)}</p>
                    <h3 className="text-xl font-semibold text-[#3F4D48]">{announcement.title}</h3>
                    <p className="text-base leading-7 text-[#3F4D48]">{announcement.body}</p>
                  </article>
                ))
              ) : (
                <article className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-4 sm:px-5">
                  <h3 className="text-xl font-semibold text-[#3F4D48]">Updates coming soon</h3>
                  <p className="text-base leading-7 text-[#3F4D48]">Announcements are being prepared for this week. Please check back shortly.</p>
                </article>
              )}
            </div>
          </BlurFade>

          <BlurFade inView delay={0.16} className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-[#3F4D48] sm:text-3xl">Our Ministries and Service Times</h2>
              <div className="h-1 w-16 bg-[#2E7D32]" />
              <p className="pt-1 text-base text-[#3F4D48] sm:text-lg">Below are our ministry highlights and service times; see announcements for updates.</p>
            </div>
            <div className="space-y-4">
              {ministryPreview.length ? (
                ministryPreview.map((ministry) => (
                  <article key={ministry.id} className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-3 sm:px-5 sm:py-4">
                    <h3 className="text-xl font-semibold text-[#2E7D32]">{ministry.title}</h3>
                    <p className="text-base leading-7 text-[#3F4D48]">
                      <span aria-hidden="true">- </span>
                      {ministry.body}
                    </p>
                  </article>
                ))
              ) : (
                <article className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-base leading-7 text-[#3F4D48]">Ministry highlights will appear here as they are added in admin.</p>
                </article>
              )}
            </div>
          </BlurFade>

          <BlurFade inView delay={0.18}>
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
    </PublicSiteShell>
  );
}
