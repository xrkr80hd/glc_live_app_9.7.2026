import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { getSocialLinksContent } from "@/lib/content";

export default async function GivePage() {
  const socialLinks = await getSocialLinksContent();

  return (
    <PublicSiteShell socialLinks={socialLinks}>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04} className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#3F4D48] sm:text-4xl">Give</h1>
            <p className="text-base leading-7 text-[#3F4D48]">Support the mission.</p>
          </BlurFade>

          <BlurFade inView delay={0.08}>
            <section className="border border-[#E3E8E6] bg-white p-4 sm:p-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-[#3F4D48]">Online Giving is coming soon</h2>
                <p className="max-w-3xl text-base leading-7 text-[#3F4D48]">Secure online giving is being set up now.</p>
              </div>
              <div className="mt-5">
                <Button asChild className="h-10 rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold !text-white hover:bg-[#2E7D32] hover:!text-white">
                  <a id="giveEmailLink" href="mailto:give@golibertychurch.com?subject=Giving%20Information">
                    Email our team
                  </a>
                </Button>
              </div>
            </section>
          </BlurFade>
        </div>
      </div>
    </PublicSiteShell>
  );
}
