import { ChurchFooterContent } from "@/components/ChurchFooterContent";
import { getSocialLinksContent } from "@/lib/content";

export async function ChurchSimpleFooter() {
  const socialLinks = await getSocialLinksContent();

  return <ChurchFooterContent socialLinks={socialLinks} theme="dark" />;
}
