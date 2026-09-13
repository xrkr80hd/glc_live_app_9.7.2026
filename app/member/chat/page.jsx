import Link from "next/link";

export const dynamic = "force-dynamic";

export default function MemberChatPage() {
  return (
    <main className="min-h-screen bg-[#1a2129] text-white">
      <div className="border-b border-white/10 bg-[#141b23] px-4 py-3">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 text-sm text-[#c8d0d8]">
          <Link href="/" className="font-semibold text-white hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-semibold text-white hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[#aab8b0]">Media Chat</span>
        </nav>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="border border-white/10 bg-[#141b23] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8ee0c2]">Media Team</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Media Chat is being rebuilt</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c8d0d8]">
            The previous chat has been removed. The replacement will be a focused service-communication workspace with one shared Media Chat and direct messages.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/media" className="inline-flex min-h-11 items-center border border-[#4f8f70] bg-[#17392a] px-4 text-sm font-bold text-white hover:bg-[#1d4934]">
              Back to Media Team
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10">
              My Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
