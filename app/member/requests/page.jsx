import Link from "next/link";
import { MinistryRequests } from "@/components/member/MinistryRequests";

export const dynamic = "force-dynamic";

export default function MemberRequestsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f5]">
      <div className="border-b border-[#dbe7e0] bg-white px-4 py-3">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 text-sm text-[#5f7469]">
          <Link href="/" className="font-semibold text-[#1f6846] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-semibold text-[#1f6846] hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[#173329]">Ministry Requests</span>
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-7">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Ministry</p>
          <h1 className="mt-1 text-3xl font-bold text-[#173329]">Requests & Restocking</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6f8379]">Let church leadership know when your ministry needs supplies, equipment, or restocking.</p>
        </div>
        <MinistryRequests />
      </div>
    </main>
  );
}
