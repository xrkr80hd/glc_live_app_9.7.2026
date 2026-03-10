import { IconBrandFacebook, IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

export function ChurchSocialIcons() {
  return (
    <div className="social-footer">
      <a
        id="youtubeLink"
        className="icon-btn"
        href="https://www.youtube.com/@GoLibertyChurch"
        target="_blank"
        rel="noopener"
        aria-label="YouTube"
      >
        <IconBrandYoutube size={20} stroke={1.8} aria-hidden="true" />
      </a>
      <a
        id="facebookLink"
        className="icon-btn"
        href="https://www.facebook.com/GoLibertyChurch"
        target="_blank"
        rel="noopener"
        aria-label="Facebook"
      >
        <IconBrandFacebook size={20} stroke={1.8} aria-hidden="true" />
      </a>
      <a
        id="instagramLink"
        className="icon-btn"
        href="https://www.instagram.com/golibertychurch/"
        target="_blank"
        rel="noopener"
        aria-label="Instagram"
      >
        <IconBrandInstagram size={20} stroke={1.8} aria-hidden="true" />
      </a>
    </div>
  );
}
