import { IconBrandFacebook, IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

const SOCIAL_FALLBACKS = {
  youtube: "https://www.youtube.com/@libertychurchcenla",
  facebook: "https://www.facebook.com/CenlaChurch/",
};

function findSocialUrl(links, platformKey, fallback = "") {
  const list = Array.isArray(links) ? links : [];
  const matched = list.find((item) => String(item?.platformKey || "").toLowerCase() === platformKey);
  const url = String(matched?.url || "").trim();
  return url || fallback;
}

export function ChurchSocialIcons({ links = [] }) {
  const youtubeUrl = findSocialUrl(links, "youtube", SOCIAL_FALLBACKS.youtube);
  const facebookUrl = findSocialUrl(links, "facebook", SOCIAL_FALLBACKS.facebook);
  const instagramUrl = findSocialUrl(links, "instagram");

  return (
    <div className="social-footer">
      <a
        id="youtubeLink"
        className="icon-btn"
        href={youtubeUrl}
        target="_blank"
        rel="noopener"
        aria-label="YouTube"
      >
        <IconBrandYoutube size={20} stroke={1.8} aria-hidden="true" />
      </a>
      <a
        id="facebookLink"
        className="icon-btn"
        href={facebookUrl}
        target="_blank"
        rel="noopener"
        aria-label="Facebook"
      >
        <IconBrandFacebook size={20} stroke={1.8} aria-hidden="true" />
      </a>
      {instagramUrl ? (
        <a id="instagramLink" className="icon-btn" href={instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
          <IconBrandInstagram size={20} stroke={1.8} aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
