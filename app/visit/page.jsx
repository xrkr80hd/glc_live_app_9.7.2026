import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";
import { VisitPlanner } from "@/components/public-site/VisitPlanner";

export default function VisitPage() {
  return (
    <>
      <ChurchHeader active="home" />
      <main className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <VisitPlanner />
        </div>
      </main>
      <ChurchSiteFooter />
    </>
  );
}
