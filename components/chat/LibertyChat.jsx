"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function nameFor(person) {
  return person?.full_name || person?.username || person?.email || "Member";
}

function initials(person) {
  return nameFor(person)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LC";
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function LibertyChat() {
  const [payload, setPayload] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showPeople, setShowPeople] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const api = useCallback(async (init = {}) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth?.getSession?.() || { data: {} };
    const token = data?.session?.access_token;
    if (!token) throw new Error("Please sign in to use chat.");
    const response = await fetch("/api/chat", {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.error || "Chat request failed.");
    return result;
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await api();
      setPayload(result);
      setError("");
      setActiveRoomId((current) => {
        if (current && result.rooms?.some((room) => room.id === current)) return current;
        return result.rooms?.[0]?.id || "";
      });
    } catch (loadError) {
      setError(loadError?.message || "Unable to load chat.");
    }
  }, [api]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  const rooms = payload?.rooms || [];
  const people = payload?.people || [];
  const me = payload?.me || null;
  const activeRoom = rooms.find((room) => room.id === activeRoomId) || null;
  const messages = useMemo(
    () => (payload?.messages || []).filter((message) => message.room_id === activeRoomId),
    [payload?.messages, activeRoomId],
  );

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    return people.filter((person) => {
      if (person.id === me?.id) return false;
      if (!query) return true;
      return [person.full_name, person.username, person.email]
        .map((value) => String(value || "").toLowerCase())
        .join(" ")
        .includes(query);
    });
  }, [people, me?.id, search]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeRoomId) {
      api({ method: "POST", body: JSON.stringify({ action: "mark-read", roomId: activeRoomId }) }).catch(() => {});
    }
  }, [messages.length, activeRoomId, api]);

  async function sendMessage(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !activeRoomId || busy) return;
    setBusy(true);
    try {
      await api({ method: "POST", body: JSON.stringify({ action: "send", roomId: activeRoomId, message }) });
      setDraft("");
      await load();
    } catch (sendError) {
      setError(sendError?.message || "Unable to send message.");
    } finally {
      setBusy(false);
    }
  }

  async function startDm(memberId) {
    setBusy(true);
    try {
      const result = await api({ method: "POST", body: JSON.stringify({ action: "start-dm", memberId }) });
      await load();
      setActiveRoomId(result.roomId);
      setShowPeople(false);
    } catch (dmError) {
      setError(dmError?.message || "Unable to open direct message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f7f5] text-[#173329]">
      <div className="mx-auto grid max-w-6xl gap-4 px-3 py-4 md:grid-cols-[280px_1fr] md:px-5">
        <aside className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
          <div className="border-b border-[#e3ece7] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Liberty Church</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold text-[#173329]">Chats</h1>
              <button
                type="button"
                onClick={() => setShowPeople((value) => !value)}
                className="rounded-full border border-[#b9d4c4] px-3 py-1.5 text-xs font-semibold text-[#1f6846] hover:bg-[#edf6f1]"
              >
                New DM
              </button>
            </div>
          </div>

          {showPeople ? (
            <div className="border-b border-[#e3ece7] bg-[#f8fbf9] p-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a member"
                className="h-10 w-full rounded-xl border border-[#cdded4] bg-white px-3 text-sm text-[#173329] outline-none placeholder:text-[#7e9188] focus:border-[#3d8b64]"
              />
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => startDm(person.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#eaf4ee]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1f6846] text-xs font-bold text-white">{initials(person)}</span>
                    <span className="min-w-0">
                      <strong className="block truncate text-sm text-[#173329]">{nameFor(person)}</strong>
                      {person.username ? <span className="block truncate text-xs text-[#71847b]">@{person.username}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <nav className="max-h-[68vh] overflow-y-auto p-2">
            {rooms.map((room) => {
              const active = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${active ? "bg-[#1f6846] text-white" : "text-[#26483a] hover:bg-[#edf6f1]"}`}
                >
                  <strong className="block text-sm">{room.name}</strong>
                  <span className={`mt-0.5 block line-clamp-2 text-xs ${active ? "text-white/75" : "text-[#7d9187]"}`}>
                    {room.description || (room.room_type === "dm" ? "Direct message" : "Private chat")}
                  </span>
                </button>
              );
            })}
            {!rooms.length && !error ? <p className="px-3 py-5 text-sm text-[#71847b]">No chats available yet.</p> : null}
          </nav>
        </aside>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
          <header className="border-b border-[#e3ece7] px-4 py-3 sm:px-5">
            <h2 className="text-lg font-bold text-[#173329]">{activeRoom?.name || "Liberty Chat"}</h2>
            <p className="text-xs text-[#71847b]">{activeRoom?.description || "Choose a conversation to begin."}</p>
          </header>

          {error ? <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8fbf9] px-3 py-4 sm:px-5">
            {messages.map((message) => {
              const mine = message.sender_member_id === me?.id;
              const sender = message.sender || people.find((person) => person.id === message.sender_member_id);
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] rounded-2xl px-3 py-2.5 shadow-sm sm:max-w-[72%] ${mine ? "rounded-br-md bg-[#1f6846] text-white" : "rounded-bl-md border border-[#dce8e1] bg-white text-[#173329]"}`}>
                    {!mine ? <p className="mb-1 text-[11px] font-bold text-[#2d7a53]">{nameFor(sender)}</p> : null}
                    <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
                    <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/65" : "text-[#8a9b93]"}`}>{formatTime(message.created_at)}{message.edited_at ? " · edited" : ""}</p>
                  </div>
                </div>
              );
            })}
            {!messages.length && activeRoom ? (
              <div className="grid h-full min-h-64 place-items-center text-center">
                <div>
                  <p className="font-semibold text-[#355b49]">No messages yet</p>
                  <p className="mt-1 text-sm text-[#7a8d84]">Start the conversation.</p>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-[#e3ece7] bg-white p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={activeRoom ? `Message ${activeRoom.name}` : "Choose a chat first"}
                disabled={!activeRoom || busy}
                rows={2}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-[#cdded4] bg-white px-3 py-2.5 text-sm text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64] disabled:bg-[#eef2ef]"
              />
              <button
                type="submit"
                disabled={!activeRoom || !draft.trim() || busy}
                className="h-12 rounded-2xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:cursor-not-allowed disabled:bg-[#9eb5a8]"
              >
                {busy ? "Sending" : "Send"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
