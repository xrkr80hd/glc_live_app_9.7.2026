import { ChurchFooterContent } from "@/components/ChurchFooterContent";
import { getSocialLinksContent } from "@/lib/content";

export async function ChurchSiteFooter() {
  const socialLinks = await getSocialLinksContent();

  return <ChurchFooterContent socialLinks={socialLinks} theme="light" />;
}
