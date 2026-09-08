import Link from "next/link";

export const metadata = {
  title: "Offline | Liberty Church",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#F6F6F2] px-5 py-16 text-[#3F4D48]">
      <section className="mx-auto max-w-xl border border-[#DDE4E0] bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Liberty Church</p>
        <h1 className="mt-2 text-3xl font-semibold">You’re offline</h1>
        <p className="mt-3 leading-7">
          The app can’t reach the internet right now. Public pages you already opened may still be available.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex h-10 items-center border border-[#1F4D3A] bg-[#1F4D3A] px-4 text-sm font-semibold text-white">
            Try Home
          </Link>
          <Link href="/member" className="inline-flex h-10 items-center border border-[#1F4D3A] px-4 text-sm font-semibold text-[#1F4D3A]">
            Member Home
          </Link>
        </div>
      </section>
    </main>
  );
}
