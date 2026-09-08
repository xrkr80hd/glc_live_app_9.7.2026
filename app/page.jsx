import { HomeAnnouncementsCarousel } from "@/components/public-site/HomeAnnouncementsCarousel";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { VisitPlanner } from "@/components/public-site/VisitPlanner";
import { HomeRuntime } from "@/components/HomeRuntime";
import { getHomepageContent, getSocialLinksContent } from "@/lib/content";
import { getPublicSiteContentBlocks } from "@/lib/site-content";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatAnnouncementDate(announcement) {
  const raw = announcement?.startsAt || announcement?.createdAt || "";
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-5 space-y-2">
      <h2 className="text-[1.65rem] font-extrabold leading-tight tracking-[-0.025em] text-[#112016] sm:text-3xl">{title}</h2>
      <div className="h-[3px] w-12 rounded-full bg-[#7BC89A]" aria-hidden="true" />
      {subtitle ? <p className="text-[0.95rem] leading-6 text-[#4B6354] sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export default async function HomePage() {
  const [{ announcements, ministries }, socialLinks, blocks] = await Promise.all([
    getHomepageContent(),
    getSocialLinksContent(),
    getPublicSiteContentBlocks(),
  ]);

  const hero = blocks.home_hero || {};
  const pastor = blocks.home_pastor || {};
  const discover = blocks.home_discover || {};

  const announcementPreview = announcements.slice(0, 8).map((announcement) => {
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

  const heroMedia = String(hero.media_url || "").trim();
  const heroMediaType = String(hero.media_type || "video").trim().toLowerCase();
  const heroBody = String(hero.body || "").trim();
  const heroAddress = /\d/.test(heroBody)
    ? heroBody
    : "100 McKeithen Dr, Alexandria, LA 71303";

  return (
    <PublicSiteShell socialLinks={socialLinks}>
      <section className="bg-white py-6 sm:py-7">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <div className="relative h-[340px] overflow-hidden bg-[#1F4D3A] sm:h-[380px]">
            {heroMedia && heroMediaType === "image" ? (
              <img src={heroMedia} alt={hero.image_alt || "Liberty Church"} className="absolute inset-0 h-full w-full object-cover" />
            ) : heroMedia ? (
              <video id="heroVideo" className="pointer-events-none absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata">
                <source src={heroMedia} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,58,43,.58),rgba(26,65,49,.22),rgba(18,58,43,.46))]" />

            <div className="relative z-10 flex h-full flex-col justify-start px-5 py-7 sm:px-8 sm:py-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/95">{hero.eyebrow || "Welcome Home"}</p>
              <h1 className="mt-3 max-w-[620px] text-[2rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-white sm:text-[2.55rem]">
                {hero.title || "Jesus-centered. Spirit-led. Family-minded."}
              </h1>

              <div className="mt-5 inline-flex w-fit max-w-full bg-white/96 px-4 py-3 text-[0.94rem] font-medium leading-5 text-[#4B6354] shadow-sm sm:px-5 sm:text-base">
                {heroAddress}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <SectionHeading title="Our Ministries and Service Times" subtitle="Below are our ministry highlights and service times; see announcements for updates." />
          <div className="space-y-3.5">
            {ministryPreview.length ? ministryPreview.map((item) => (
              <article key={item.id} className="relative rounded-[16px] border border-[#CFEAD9] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(17,32,22,0.05)]">
                <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[#7BC89A]" aria-hidden="true" />
                <p className="text-[0.95rem] leading-6 text-[#4B6354] sm:text-base">
                  <strong className="font-extrabold text-[#1F8A4C]">{item.title}</strong>
                  <span aria-hidden="true"> — </span>
                  {item.body}
                </p>
              </article>
            )) : (
              <div className="rounded-[16px] border border-[#CFEAD9] bg-white px-5 py-4 text-[#4B6354]">Ministry information will appear here.</div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FBF9] py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <SectionHeading title={pastor.eyebrow || "Meet Our Pastor"} />
          <div className="grid gap-5 md:grid-cols-[1fr_380px] md:items-center md:gap-7">
            <div>
              <h3 className="mb-3 text-xl font-extrabold text-[#112016] sm:text-2xl">{pastor.title || "Pastor Andrew Stokes"}</h3>
              <p className="text-[0.96rem] leading-7 text-[#4B6354] sm:text-base sm:leading-8">{pastor.body}</p>
            </div>
            {pastor.image_url ? (
              <div className="overflow-hidden rounded-[18px] border border-[#CFEAD9] bg-white shadow-[0_8px_24px_rgba(17,32,22,0.08)]">
                <img src={pastor.image_url} alt={pastor.image_alt || pastor.title || "Pastor Andrew Stokes and family"} className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <SectionHeading title="What&apos;s Happening At Liberty" subtitle="Stay updated with the latest news and upcoming events at Liberty Church." />
          <HomeAnnouncementsCarousel announcements={announcementPreview} />
        </div>
      </section>

      <section className="bg-[#F8FBF9] py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <SectionHeading title={discover.title || "Discover Liberty Church"} subtitle={discover.body} />
          <div className="flex flex-wrap gap-3">
            <Link href={discover.cta_url || "/beliefs"} className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#1F8A4C] px-5 text-sm font-bold text-white hover:bg-[#16643A]">
              {discover.cta_label || "Learn More About Our Church"}
            </Link>
            <Link href="/visit" className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#B9DCC7] bg-white px-5 text-sm font-bold text-[#16643A] hover:bg-[#EFF8F2]">
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <VisitPlanner compact />
        </div>
      </section>

      <HomeRuntime />
    </PublicSiteShell>
  );
}
