import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { memberBeliefGroups } from "@/lib/member-page-data";

export default function BeliefsPage() {
  return (
    <AppShell navKey="more" title="Beliefs" subtitle="Read our core beliefs.">
      <BackRow fallbackHref="/member/more" />

      <section className="lc-stack">
        {memberBeliefGroups.map((group, index) => (
          <details key={group.id} className="overflow-hidden border border-[#1F4D3A] bg-white" open={index === 0}>
            <summary className="group flex cursor-pointer list-none items-center justify-between bg-[#1F4D3A] px-4 py-3 text-white">
              <span className="text-base font-semibold">{group.title}</span>
              <ChevronDown className="size-4 text-white/85 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="divide-y divide-[#E3E8E6] border-t border-[#E3E8E6] px-4 py-1">
              {group.items.map((item) => (
                <article key={item.id} className="py-4">
                  <h2 className="text-lg font-semibold text-[#3F4D48]">{item.title}</h2>
                  <p className="mt-1 text-[15px] leading-7 text-[#3F4D48]">{item.summary}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold text-[#1F4D3A]">Learn More</summary>
                    <p className="mt-2 text-[15px] leading-7 text-[#3F4D48]">{item.detail}</p>
                  </details>
                </article>
              ))}
            </div>
          </details>
        ))}
      </section>
    </AppShell>
  );
}
