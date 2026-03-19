import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconClockHour10,
  IconMapPin,
  IconUsersGroup,
} from "@tabler/icons-react";
import { getSocialLinksContent } from "@/lib/content";

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

export async function ChurchSimpleFooter() {
  const socialLinks = await getSocialLinksContent();
  const youtubeUrl = findSocialUrl(socialLinks, "youtube", SOCIAL_FALLBACKS.youtube);
  const facebookUrl = findSocialUrl(socialLinks, "facebook", SOCIAL_FALLBACKS.facebook);
  const instagramUrl = findSocialUrl(socialLinks, "instagram");

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">
              <IconClockHour10 size={18} stroke={1.9} aria-hidden="true" />
              <span>Service Times</span>
            </h4>
            <p>
              Sundays @ 10:00 AM
              <br />
              Youth Devotion @ 9:20 AM
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">
              <IconMapPin size={18} stroke={1.9} aria-hidden="true" />
              <span>Location</span>
            </h4>
            <p>
              100 McKeithen Dr
              <br />
              Alexandria, LA 71303
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">
              <IconUsersGroup size={18} stroke={1.9} aria-hidden="true" />
              <span>Connect</span>
            </h4>
            <div className="social-links">
              <a href={youtubeUrl} target="_blank" rel="noopener">
                <IconBrandYoutube size={16} stroke={1.9} aria-hidden="true" />
                YouTube
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener">
                <IconBrandFacebook size={16} stroke={1.9} aria-hidden="true" />
                Facebook
              </a>
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener">
                  <IconBrandInstagram size={16} stroke={1.9} aria-hidden="true" />
                  Instagram
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Liberty Church. All rights reserved.</p>
          <p style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.7 }}>
            Made with love by{" "}
            <a
              href="https://www.xrkr80hd.studio"
              target="_blank"
              rel="noopener"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              xrkr80hd designs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
