"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function displayName(person) {
  return person?.full_name || person?.username || person?.email || "Liberty Member";
}

function initials(value) {
  return String(typeof value === "string" ? value : displayName(value))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LC";
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { weekday: "short" });
}

function Avatar({ person, label, online = false, large = false }) {
  const photo = person?.profile_photo_url;
  const text = label || displayName(person);
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#1d4c38] bg-white font-black text-[#1d4c38] ${large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"}`}>
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(text)}
      {online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#1d4c38]" aria-label="Online" /> : null}
    </span>
  );
}

export function LibertyChat() {
  const [payload, setPayload] = useState(null);
  const [search, setSearch] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [openRoomIds, setOpenRoomIds] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const knownIds = useRef(new Set());
  const loadedOnce = useRef(false);

  const api = useCallback(async (init = {}) => {
    const response = await fetch("/api/chat", {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json", ...(init.headers || {}) },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.error || "Unable to load Liberty Chat.");
    return result;
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await api();
      const nextMessages = result.messages || [];
      if (loadedOnce.current) {
        const newest = [...nextMessages].reverse().find((message) =>
          message.sender_member_id !== result.me?.id && !knownIds.current.has(String(message.id)),
        );
        if (newest && newest.room_id !== activeRoomId) {
          const sender = newest.sender || (result.people || []).find((person) => person.id === newest.sender_member_id);
          setToast({ roomId: newest.room_id, sender: displayName(sender), body: newest.body });
        }
      }
      knownIds.current = new Set(nextMessages.map((message) => String(message.id)));
      loadedOnce.current = true;
      setPayload(result);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load Liberty Chat.");
    }
  }, [api, activeRoomId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  const rooms = payload?.rooms || [];
  const people = payload?.people || [];
  const me = payload?.me || null;
  const messages = payload?.messages || [];
  const mainRoom = rooms.find((room) => room.room_type === "members") || null;
  const activeRoom = rooms.find((room) => room.id === activeRoomId) || null;

  useEffect(() => {
    if (!me?.id) return undefined;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return undefined;
    const channel = supabase.channel("liberty-chat-presence", { config: { presence: { key: me.id } } });
    channel
      .on("presence", { event: "sync" }, () => setOnlineUserIds(new Set(Object.keys(channel.presenceState()))))
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => void load())
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ member_id: me.id, online_at: new Date().toISOString() });
      });
    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [me?.id, load]);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((person) => {
      if (person.id === me?.id) return false;
      if (!q) return true;
      return [person.full_name, person.username, person.email].some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [people, me?.id, search]);

  function roomMessages(roomId) {
    return messages.filter((message) => message.room_id === roomId);
  }

  function dmPerson(room) {
    if (!room || room.room_type !== "dm") return null;
    const otherId = (room.participant_ids || []).find((id) => id !== me?.id);
    return people.find((person) => person.id === otherId) || null;
  }

  function roomTitle(room) {
    if (!room) return "Chat";
    if (room.room_type === "members") return "Main Chat";
    if (room.room_type === "dm") return displayName(dmPerson(room));
    return room.name || "Chat";
  }

  async function markRead(roomId) {
    if (!roomId) return;
    try {
      await api({ method: "POST", body: JSON.stringify({ action: "mark-read", roomId }) });
      void load();
    } catch {}
  }

  function openRoom(roomId) {
    if (!roomId) return;
    setActiveRoomId(roomId);
    setOpenRoomIds((current) => current.includes(roomId) ? current : [...current, roomId]);
    void markRead(roomId);
  }

  async function startDm(memberId) {
    setBusy(`person:${memberId}`);
    try {
      const result = await api({ method: "POST", body: JSON.stringify({ action: "start-dm", memberId }) });
      await load();
      openRoom(result.roomId);
    } catch (err) {
      setError(err?.message || "Unable to open direct message.");
    } finally {
      setBusy("");
    }
  }

  async function send(roomId) {
    const text = String(drafts[roomId] || "").trim();
    if (!text) return;
    setBusy(roomId);
    try {
      await api({ method: "POST", body: JSON.stringify({ action: "send", roomId, message: text }) });
      setDrafts((current) => ({ ...current, [roomId]: "" }));
      await load();
    } catch (err) {
      setError(err?.message || "Unable to send message.");
    } finally {
      setBusy("");
    }
  }

  function Conversation({ room, desktopBox = false }) {
    const person = dmPerson(room);
    const list = roomMessages(room.id);
    return (
      <section className={`${desktopBox ? "w-[340px] shadow-2xl" : "min-h-[62vh] w-full"} flex flex-col overflow-hidden border-2 border-black bg-white`}>
        <header className="flex items-center gap-3 border-b-2 border-black bg-[#1d4c38] px-4 py-3 text-white">
          <Avatar person={person} label={roomTitle(room)} online={person ? onlineUserIds.has(person.id) : false} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-black text-white">{roomTitle(room)}</h2>
            <p className="truncate text-xs font-semibold text-white">{room.room_type === "dm" ? (onlineUserIds.has(person?.id) ? "Online" : "Offline · messages will be delivered") : room.description || "Liberty Church conversation"}</p>
          </div>
          <button type="button" onClick={() => setActiveRoomId("")} className="grid h-10 w-10 place-items-center border-2 border-white bg-[#1d4c38] text-xl font-black text-white" aria-label="Close chat">×</button>
        </header>
        <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
          <div className="space-y-3">
            {list.length ? list.map((message) => {
              const mine = message.sender_member_id === me?.id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] border-2 px-3 py-2 ${mine ? "border-[#1d4c38] bg-[#1d4c38] text-white" : "border-black bg-white text-black"}`}>
                    {!mine && room.room_type !== "dm" ? <p className="mb-1 text-[11px] font-black text-[#1d4c38]">{displayName(message.sender)}</p> : null}
                    <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "text-white" : "text-black"}`}>{formatTime(message.created_at)}</p>
                  </div>
                </div>
              );
            }) : <p className="py-10 text-center text-sm font-semibold text-black">No messages yet. Start the conversation.</p>}
          </div>
        </div>
        <div className="border-t-2 border-black bg-white p-3">
          <div className="flex items-end gap-2">
            <textarea value={drafts[room.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [room.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(room.id); } }} rows={2} placeholder={`Message ${roomTitle(room)}`} className="min-h-12 flex-1 resize-none border-2 border-black bg-white px-3 py-2 text-[16px] text-black outline-none focus:border-[#1d4c38]" />
            <button type="button" onClick={() => void send(room.id)} disabled={busy === room.id} className="min-h-12 border-2 border-black bg-[#1d4c38] px-4 font-black text-white disabled:opacity-50">Send</button>
          </div>
        </div>
      </section>
    );
  }

  if (!payload && !error) {
    return <div className="liberty-chat-shell grid min-h-[60vh] place-items-center bg-white p-8 font-black text-black">Loading Liberty Chat…</div>;
  }

  return (
    <div className="liberty-chat-shell relative bg-white text-black">
      {toast ? <button type="button" onClick={() => { openRoom(toast.roomId); setToast(null); }} className="fixed right-3 top-3 z-[70] w-[min(92vw,360px)] border-2 border-black bg-white p-3 text-left shadow-xl"><strong className="block text-sm text-black">{toast.sender}</strong><span className="mt-1 block text-xs text-black">{toast.body}</span></button> : null}

      <section className="liberty-chat-header border-b-2 border-black bg-[#1d4c38] px-4 py-5 text-white">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white">Liberty Church</p>
              <h1 className="mt-1 text-3xl font-black text-white">Liberty Chat</h1>
            </div>
            <button type="button" onClick={() => document.getElementById("member-search")?.focus()} className="grid h-12 w-12 place-items-center border-2 border-white bg-[#1d4c38] text-2xl text-white" aria-label="Start a new message">✎</button>
          </div>
          <div className="mt-4">
            <label htmlFor="member-search" className="sr-only">Search Liberty members</label>
            <input id="member-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Liberty members" className="h-12 w-full border-2 border-black bg-white px-4 text-[16px] font-semibold text-black outline-none focus:border-black" />
          </div>
        </div>
      </section>

      {error ? <div className="mx-auto mt-4 max-w-[1180px] px-4"><div className="border-2 border-black bg-white p-4 font-black text-red-800">{error}</div></div> : null}

      <div className="mx-auto grid max-w-[1180px] gap-5 px-4 py-5 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-5">
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-black">Start a conversation</h2>
                <p className="text-sm text-black">Tap any Liberty member. Offline members receive it when they return.</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto border-y-2 border-black bg-white py-3">
              {mainRoom ? <button type="button" onClick={() => openRoom(mainRoom.id)} className="w-20 shrink-0 text-center"><Avatar label="Main Chat" large /><span className="mt-1 block text-xs font-black text-black">Main Chat</span></button> : null}
              {filteredPeople.slice(0, 12).map((person) => <button key={person.id} type="button" onClick={() => void startDm(person.id)} className="w-20 shrink-0 text-center" disabled={busy === `person:${person.id}`}><Avatar person={person} online={onlineUserIds.has(person.id)} large /><span className="mt-1 block truncate text-xs font-black text-black">{displayName(person)}</span></button>)}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-black">Recent conversations</h2>
            <div className="border-2 border-black bg-white">
              {rooms.length ? rooms.map((room) => {
                const latest = room.latest_message;
                const person = dmPerson(room);
                return <button key={room.id} type="button" onClick={() => openRoom(room.id)} className="flex w-full items-center gap-3 border-b border-black px-3 py-3 text-left last:border-b-0 hover:bg-[#f5f7f6]"><Avatar person={person} label={roomTitle(room)} online={person ? onlineUserIds.has(person.id) : false} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><strong className="truncate text-sm font-black text-black">{roomTitle(room)}</strong><span className="text-xs font-semibold text-black">{formatTime(latest?.created_at || room.updated_at)}</span></div><p className="mt-1 truncate text-sm text-black">{latest?.body || room.description || "Open conversation"}</p>{room.unread_count ? <span className="mt-1 inline-block text-xs font-black text-[#1d4c38]">{room.unread_count} new</span> : null}</div></button>;
              }) : <p className="p-4 text-sm font-semibold text-black">No conversations yet.</p>}
            </div>
          </section>
        </aside>

        <main className="min-w-0">
          {activeRoom ? <Conversation room={activeRoom} /> : <section className="grid min-h-[62vh] place-items-center border-2 border-black bg-[#f5f7f6] p-6 text-center"><div><h2 className="text-2xl font-black text-black">Choose a conversation</h2><p className="mt-2 max-w-md text-sm leading-6 text-black">Open Main Chat, choose a recent conversation, or search for a Liberty member to start a direct message.</p></div></section>}
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 hidden justify-end gap-3 p-4 lg:flex">
        {openRoomIds.filter((id) => id !== activeRoomId).slice(-3).map((id) => {
          const room = rooms.find((entry) => entry.id === id);
          return room ? <div key={id} className="pointer-events-auto"><Conversation room={room} desktopBox /></div> : null;
        })}
      </div>
    </div>
  );
}
