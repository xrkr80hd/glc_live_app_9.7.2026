import Link from "next/link";
import { LibertyChat } from "@/components/chat/LibertyChat";

export const dynamic = "force-dynamic";

export default function MemberChatPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b-2 border-black bg-white px-4 py-3">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2 text-sm font-bold text-[#0b4f2a]">
          <Link href="/" className="font-black text-[#178b43] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-black text-[#178b43] hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-black text-black">Chats</span>
        </nav>
      </div>
      <LibertyChat />
    </main>
  );
}
