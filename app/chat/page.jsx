import Link from "next/link";
import { LibertyChat } from "@/components/chat/LibertyChat";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f5]">
      <div className="border-b border-[#dbe7e0] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-[#5f7469]">
          <Link href="/" className="font-semibold text-[#1f6846] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-semibold text-[#1f6846] hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#173329]">Chats</span>
        </div>
      </div>
      <LibertyChat />
    </main>
  );
}
