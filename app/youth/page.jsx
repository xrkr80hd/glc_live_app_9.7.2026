import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { Button } from "@/components/ui/button";
import { getYouthPageContent } from "@/lib/content";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getAnnouncementImage(item) {
  const imageUrl = String(item?.imageUrl || item?.image_url || "").trim();
  const imageAltRaw = String(item?.imageAlt || item?.image_alt || "").trim();
  const title = String(item?.title || "").trim();
  return {
    imageUrl,
    imageAlt: imageAltRaw || (title ? `${title} announcement image` : "Announcement image"),
  };
}

function isSyntheticAnnouncement(item) {
  return String(item?.id || "").trim().toLowerCase().startsWith("fallback-");
}

function getTickerItems(announcements) {
  const items = (announcements || [])
    .map((item) => String(item?.title || "").replace(/\p{Extended_Pictographic}/gu, "").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);
  return items.length ? items : ["Sundays @ 9:20 AM — Youth Devotion", "Pop-Up Events — Check back for more info"];
}

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture } = await getYouthPageContent();
  const publicAnnouncements = (youthAnnouncements || []).filter((item) => !isSyntheticAnnouncement(item));
  const tickerItems = getTickerItems(publicAnnouncements);
  const scriptureTitle = String(youthScripture?.title || "").trim();
  const showScriptureTitle = scriptureTitle && scriptureTitle.toLowerCase() !== "scripture";

  return (
    <>
      <BodyClass className="youth" />
      <ChurchHeader active="youth" youthBrand />

      <section className="bg-[#07111f] py-6 sm:py-7">
        <div className="mx-auto w-full max-w-[1100px] px-5">
          <div className="relative h-[340px] overflow-hidden border border-[#66e49e]/30 bg-[#172034] sm:h-[380px]">
            <video className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-72 contrast-110 saturate-125" autoPlay loop muted playsInline preload="metadata" poster="/assets/youth-backdrop.png">
              <source src="https://www.golibertychurch.com/assets/LC_YOUTH_HERO_VID.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,31,0.82)_0%,rgba(26,42,69,0.42)_54%,rgba(10,18,31,0.74)_100%)]" />
            <div className="relative z-10 flex h-full flex-col justify-start px-5 py-7 sm:px-8 sm:py-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b7d9ff]">We Are</p>
              <h1 className="mt-3 max-w-[620px] text-[2rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-white sm:text-[2.55rem]">Liberty Church Youth</h1>
              <div className="mt-5 max-w-[560px] border-l-4 border-[#66e49e] bg-[#08111f]/55 px-4 py-3 backdrop-blur-[2px]">
                <p className="text-[0.95rem] leading-6 text-white/90 sm:text-base">A place for students to encounter Jesus, build bold faith, and grow together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="youth-ticker" aria-live="polite">
        <div className="ticker-track">
          {tickerItems.map((text, index) => <div key={`ticker-a-${index}`} className="ticker-item">{text}</div>)}
          {tickerItems.map((text, index) => <div key={`ticker-b-${index}`} className="ticker-item" aria-hidden="true">{text}</div>)}
        </div>
      </section>

      <section className="section alt youth-scripture" id="week-in-word">
        <div className="container">
          <div className="section-head"><h2>Scripture of the Week</h2></div>
          <article className="glass-card youth-scripture-single">
            <p id="scripture-reference" className="youth-scripture-reference">{youthScripture.reference}</p>
            {showScriptureTitle ? <h3>{scriptureTitle}</h3> : null}
            <blockquote className="youth-scripture-verse"><p id="scripture-text">{youthScripture.verse_text}</p></blockquote>
            <h3>Lean In</h3>
            <blockquote className="youth-scripture-verse youth-devotional-copy"><p id="devotional-text">{youthScripture.devotional_text || "Take this verse with you this week and ask God how to live it out today."}</p></blockquote>
          </article>
        </div>
      </section>

      <section className="section alt youth-announcements" id="announcements">
        <div className="container">
          <div className="section-head"><h2>Announcements and Events</h2><p className="sub">Latest youth updates.</p></div>
          <div className="announcements-grid" id="announcements-grid">
            {publicAnnouncements.length ? publicAnnouncements.map((item) => {
              const { imageUrl, imageAlt } = getAnnouncementImage(item);
              return (
                <article key={item.id} className="announcement-card">
                  {imageUrl ? <div className="announcement-image-wrap"><img src={imageUrl} alt={imageAlt} loading="lazy" /></div> : null}
                  <h3>{item.title}</h3><p>{item.body}</p>
                </article>
              );
            }) : <article className="announcement-card empty" id="announcements-empty"><p className="muted">Announcements are coming soon. Stay tuned for our next hangout!</p></article>}
          </div>
        </div>
      </section>

      <section className="section alt youth-media-section" id="youth-media">
        <div className="container">
          <div className="section-head"><h2>Youth Media</h2></div>
          <div className="youth-media-actions">
            <Button asChild variant="youth" className="h-10 rounded-none px-4 text-sm font-semibold !text-white"><Link href="/youth/media">View Youth Media</Link></Button>
          </div>
        </div>
      </section>

      <ChurchSimpleFooter />

      <style dangerouslySetInnerHTML={{ __html: `
        .youth-ticker{background:linear-gradient(90deg,#172034 0%,#21314f 50%,#172034 100%);border-top:1px solid rgba(102,228,158,.35);border-bottom:1px solid rgba(102,228,158,.35);padding:.95rem 0;overflow:hidden;position:relative;box-shadow:0 12px 32px rgba(2,8,22,.4)}
        .ticker-track{display:flex;min-width:max-content;animation:tickerScroll 28s linear infinite}.ticker-track:hover{animation-play-state:paused}.ticker-item{color:#fff;font-size:1.1rem;font-weight:600;white-space:nowrap;padding:0 2.5rem;display:flex;align-items:center;letter-spacing:.04em}
        .youth-scripture-single{display:grid;gap:.85rem}.youth-scripture-single h3{margin:0;font-size:.96rem;letter-spacing:.05em;text-transform:uppercase}.youth-scripture-reference{margin:0;font-size:.96rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}.youth-scripture-verse{margin:0;padding-left:.9rem;border-left:3px solid rgba(102,228,158,.55)}.youth-scripture-verse p{margin:0}.youth-devotional-copy{color:rgba(255,255,255,.92)}
        .announcement-image-wrap{margin-bottom:.8rem;border-radius:12px;overflow:hidden;border:1px solid rgba(102,228,158,.32);background:rgba(10,18,31,.62)}.announcement-image-wrap img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.youth-media-actions{display:flex;justify-content:flex-start}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media(max-width:768px){.youth-ticker{padding:.8rem 0}.ticker-item{font-size:.95rem;padding:0 1.5rem}.youth-media-callout{gap:.9rem}.youth-media-callout-btn{width:100%}}
      ` }} />
    </>
  );
}
