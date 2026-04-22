import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconClockHour10,
  IconMailbox,
  IconMapPin,
  IconUsersGroup,
} from "@tabler/icons-react";

const SOCIAL_FALLBACKS = {
  youtube: "https://www.youtube.com/@libertychurchcenla",
  facebook: "https://www.facebook.com/CenlaChurch/",
};

const PHYSICAL_ADDRESS_LINES = ["100 McKeithen Dr", "Alexandria, LA 71303"];
const MAILING_ADDRESS_LINES = ["PO BOX 11766", "Alexandria, LA 71315"];
const SERVICE_TIMES = ["Sundays @ 10:00 AM", "Youth Devotion @ 9:20 AM"];

function findSocialUrl(links, platformKey, fallback = "") {
  const list = Array.isArray(links) ? links : [];
  const matched = list.find((item) => String(item?.platformKey || "").toLowerCase() === platformKey);
  const url = String(matched?.url || "").trim();
  return url || fallback;
}

export function ChurchFooterContent({ socialLinks = [], theme = "dark" }) {
  const isLight = theme === "light";
  const youtubeUrl = findSocialUrl(socialLinks, "youtube", SOCIAL_FALLBACKS.youtube);
  const facebookUrl = findSocialUrl(socialLinks, "facebook", SOCIAL_FALLBACKS.facebook);
  const instagramUrl = findSocialUrl(socialLinks, "instagram");

  const footerClassName = isLight
    ? "border-t border-[#D9DED8] bg-[#F6F6F2] text-[#3F4D48]"
    : "border-t border-white/12 bg-[#172034] text-white";
  const innerClassName = isLight
    ? "mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8"
    : "mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8";
  const gridClassName = isLight
    ? "grid grid-cols-2 items-start gap-x-5 gap-y-6 lg:grid-cols-3"
    : "grid grid-cols-2 items-start gap-x-5 gap-y-6 lg:grid-cols-3";
  const titleClassName = isLight
    ? "mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1F4D3A]"
    : "mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#b7d9ff]";
  const bodyClassName = isLight
    ? "space-y-3 text-sm leading-6 text-[#3F4D48]"
    : "space-y-3 text-sm leading-6 text-white/88";
  const addressBodyClassName = isLight
    ? "space-y-2 text-sm leading-6 text-[#3F4D48]"
    : "space-y-2 text-sm leading-6 text-white/88";
  const linkClassName = isLight
    ? "inline-flex items-center gap-2 text-sm text-[#3F4D48] transition hover:text-[#1F4D3A]"
    : "inline-flex items-center gap-2 text-sm text-white/88 transition hover:text-white";
  const bottomClassName = isLight
    ? "mx-auto flex w-full max-w-6xl flex-col gap-1.5 border-t border-[#D9DED8] px-4 py-4 text-[13px] text-[#3F4D48]/78 sm:px-6 sm:py-5 sm:text-sm lg:px-8"
    : "mx-auto flex w-full max-w-6xl flex-col gap-1.5 border-t border-white/12 px-4 py-4 text-[13px] text-white/72 sm:px-6 sm:py-5 sm:text-sm lg:px-8";
  const accentClassName = isLight ? "text-[#1F4D3A]" : "text-[#b7d9ff]";
  const mailingLabelClassName = isLight
    ? "mb-0.5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1F4D3A]"
    : "mb-0.5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#b7d9ff]";
  const leftColumnClassName = isLight
    ? "min-w-0 text-left"
    : "min-w-0 text-left";
  const centerColumnClassName = isLight
    ? "order-last col-span-2 min-w-0 text-left lg:order-none lg:col-span-1 lg:justify-self-center lg:text-center"
    : "order-last col-span-2 min-w-0 text-left lg:order-none lg:col-span-1 lg:justify-self-center lg:text-center";
  const rightColumnClassName = isLight
    ? "min-w-0 text-left justify-self-end lg:justify-self-end lg:text-right"
    : "min-w-0 text-left justify-self-end lg:justify-self-end lg:text-right";
  const centerTitleClassName = `${titleClassName} lg:justify-center`;
  const rightTitleClassName = `${titleClassName} justify-end lg:justify-end`;
  const centerMailingLabelClassName = `${mailingLabelClassName} lg:justify-center`;
  const rightLinksClassName = isLight
    ? "flex flex-col gap-2 items-end lg:items-end"
    : "flex flex-col gap-2 items-end lg:items-end";

  return (
    <footer className={footerClassName}>
      <div className={innerClassName}>
        <div className={gridClassName}>
          <div className={leftColumnClassName}>
            <h4 className={titleClassName}>
              <IconClockHour10 size={18} stroke={1.9} aria-hidden="true" className={accentClassName} />
              <span>Service Times</span>
            </h4>
            <div className={bodyClassName}>
              <p>{SERVICE_TIMES[0]}</p>
              <p>{SERVICE_TIMES[1]}</p>
            </div>
          </div>

          <div className={centerColumnClassName}>
            <h4 className={centerTitleClassName}>
              <IconMapPin size={18} stroke={1.9} aria-hidden="true" className={accentClassName} />
              <span>Physical Address</span>
            </h4>
            <div className={addressBodyClassName}>
              <p>
                {PHYSICAL_ADDRESS_LINES[0]}
                <br />
                {PHYSICAL_ADDRESS_LINES[1]}
              </p>
              <p>
                <span className={centerMailingLabelClassName}>
                  <IconMailbox size={16} stroke={1.9} aria-hidden="true" className={accentClassName} />
                  <span>Mailing Address</span>
                </span>
                <br />
                {MAILING_ADDRESS_LINES[0]}
                <br />
                {MAILING_ADDRESS_LINES[1]}
              </p>
            </div>
          </div>

          <div className={rightColumnClassName}>
            <h4 className={rightTitleClassName}>
              <IconUsersGroup size={18} stroke={1.9} aria-hidden="true" className={accentClassName} />
              <span>Connect</span>
            </h4>
            <div className={rightLinksClassName}>
              <a href={youtubeUrl} target="_blank" rel="noopener" className={linkClassName}>
                <IconBrandYoutube size={16} stroke={1.9} aria-hidden="true" />
                YouTube
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener" className={linkClassName}>
                <IconBrandFacebook size={16} stroke={1.9} aria-hidden="true" />
                Facebook
              </a>
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener" className={linkClassName}>
                  <IconBrandInstagram size={16} stroke={1.9} aria-hidden="true" />
                  Instagram
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className={bottomClassName}>
        <p>&copy; {new Date().getFullYear()} Liberty Church. All rights reserved.</p>
        <p>
          Made with love by{" "}
          <a href="https://www.xrkr80hd.studio" target="_blank" rel="noopener" className="underline underline-offset-2">
            xrkr80hd designs
          </a>
        </p>
      </div>
    </footer>
  );
}
