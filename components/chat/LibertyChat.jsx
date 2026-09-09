"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function nameFor(person) {
  return person?.full_name || person?.username || person?.email || "Member";
}

function initials(personOrName) {
  const value = typeof personOrName === "string" ? personOrName : nameFor(personOrName);
  return value
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
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { weekday: "short" });
}

function truncate(value, max = 58) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function Avatar({ person, label, online = false, size = "md" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  const photo = person?.profile_photo_url;
  const display = label || nameFor(person);
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#178b43] bg-white font-black text-[#0b4f2a] ${sizeClass}`}>
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(display)}
      {online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#20b94b]" aria-label="Online" /> : null}
    </span>
  );
}

export function LibertyChat() {
  const [payload, setPayload] = useState(null);
  const [search, setSearch] = useState("");
  const [mobileRoomId, setMobileRoomId] = useState("");
  const [openRoomIds, setOpenRoomIds] = useState([]);
  const [collapsedRoomIds, setCollapsedRoomIds] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [busyRoomId, setBusyRoomId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState("chats");
  const knownMessageIdsRef = useRef(new Set());
  const loadedOnceRef = useRef(false);

  const api = useCallback(async (init = {}) => {
    const response = await fetch("/api/chat", {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
      credentials: "same-origin",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.error || "Chat request failed.");
    return result;
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await api();
      const nextMessages = result.messages || [];
      if (loadedOnceRef.current) {
        const newest = [...nextMessages].reverse().find((message) =>
          message.sender_member_id !== result.me?.id && !knownMessageIdsRef.current.has(String(message.id))
        );
        if (newest) {
          const room = result.rooms?.find((entry) => entry.id === newest.room_id);
          const sender = newest.sender || result.people?.find((person) => person.id === newest.sender_member_id);
          const currentlyViewing = newest.room_id === mobileRoomId || openRoomIds.includes(newest.room_id);
          if (!currentlyViewing) {
            setToast({ roomId: newest.room_id, title: nameFor(sender), message: truncate(newest.body, 72), roomName: room?.name || "Chat" });
          }
        }
      }
      knownMessageIdsRef.current = new Set(nextMessages.map((message) => String(message.id)));
      loadedOnceRef.current = true;
      setPayload(result);
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "Unable to load chat.");
    }
  }, [api, mobileRoomId, openRoomIds]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("liberty.open-chats") || "[]");
      if (Array.isArray(saved)) setOpenRoomIds(saved);
    } catch {}
    void load();
    const timer = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("liberty.open-chats", JSON.stringify(openRoomIds)); } catch {}
  }, [openRoomIds]);

  const rooms = payload?.rooms || [];
  const people = payload?.people || [];
  const me = payload?.me || null;
  const messages = payload?.messages || [];
  const mainRoom = rooms.find((room) => room.room_type === "members") || rooms[0] || null;

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
    if (room.room_type === "dm") return nameFor(dmPerson(room));
    return room.room_type === "members" ? "Main Chat" : room.name;
  }

  function roomAvatarPerson(room) {
    return room?.room_type === "dm" ? dmPerson(room) : null;
  }

  function latestPreview(room) {
    const latest = room?.latest_message || roomMessages(room?.id).slice(-1)[0];
    if (!latest) return room?.room_type === "members" ? "Everybody at Liberty can chat here." : room?.description || "Open conversation";
    const mine = latest.sender_member_id === me?.id;
    const prefix = mine ? "You: " : latest.sender ? `${nameFor(latest.sender)}: ` : "";
    return `${prefix}${truncate(latest.body)}`;
  }

  async function markRead(roomId) {
    if (!roomId) return;
    try {
      await api({ method: "POST", body: JSON.stringify({ action: "mark-read", roomId }) });
    } catch {}
  }

  function openRoom(roomId, { mobile = false } = {}) {
    if (!roomId) return;
    if (mobile) setMobileRoomId(roomId);
    else {
      const room = rooms.find((entry) => entry.id === roomId);
      if (room?.room_type !== "members") {
        setOpenRoomIds((current) => current.includes(roomId) ? current : [...current, roomId]);
        setCollapsedRoomIds((current) => current.filter((id) => id !== roomId));
      }
    }
    void markRead(roomId);
  }

  async function startDm(memberId, { mobile = false } = {}) {
    setBusyRoomId(`person:${memberId}`);
    try {
      const result = await api({ method: "POST", body: JSON.stringify({ action: "start-dm", memberId }) });
      await load();
      openRoom(result.roomId, { mobile });
    } catch (dmError) {
      setError(dmError?.message || "Unable to open direct message.");
    } finally {
      setBusyRoomId("");
    }
  }

  async function send(roomId) {
    const text = String(drafts[roomId] || "").trim();
    if (!text || busyRoomId) return;
    setBusyRoomId(roomId);
    try {
      await api({ method: "POST", body: JSON.stringify({ action: "send", roomId, message: text }) });
      setDrafts((current) => ({ ...current, [roomId]: "" }));
      await load();
    } catch (sendError) {
      setError(sendError?.message || "Unable to send message.");
    } finally {
      setBusyRoomId("");
    }
  }

  function handleComposerKey(event, roomId) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(roomId);
    }
  }

  function closeDesktopRoom(roomId) {
    setOpenRoomIds((current) => current.filter((id) => id !== roomId));
    setCollapsedRoomIds((current) => current.filter((id) => id !== roomId));
  }

  const recentRooms = [...rooms].sort((a, b) => {
    if (a.room_type === "members") return -1;
    if (b.room_type === "members") return 1;
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  });
  const totalUnread = rooms.reduce((sum, room) => sum + Number(room.unread_count || 0), 0);

  function MessageList({ room, compact = false }) {
    const list = roomMessages(room.id);
    const endRef = useRef(null);
    useEffect(() => {
      endRef.current?.scrollIntoView({ block: "end" });
    }, [list.length]);
    return (
      <div className={`flex-1 overflow-y-auto bg-white ${compact ? "px-3 py-3" : "px-4 py-5"}`}>
        <div className="space-y-3">
          {list.map((message) => {
            const mine = message.sender_member_id === me?.id;
            const sender = message.sender || people.find((person) => person.id === message.sender_member_id);
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] border px-3 py-2 ${mine ? "border-[#0b4f2a] bg-[#0b4f2a] text-white" : "border-black bg-white text-[#0b4f2a]"}`}>
                  {!mine && room.room_type !== "dm" ? <p className="mb-1 text-[11px] font-black text-[#178b43]">{nameFor(sender)}</p> : null}
                  <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white" : "text-[#0b4f2a]"}`}>{formatTime(message.created_at)}{message.edited_at ? " · edited" : ""}</p>
                </div>
              </div>
            );
          })}
          {!list.length ? <p className="py-10 text-center text-sm font-semibold text-[#0b4f2a]">No messages yet. Start the conversation.</p> : null}
          <div ref={endRef} />
        </div>
      </div>
    );
  }

  function Composer({ room, compact = false }) {
    if (!room?.can_post) return <div className="border-t-2 border-black bg-white p-3 text-sm font-bold text-[#0b4f2a]">Read-only conversation.</div>;
    return (
      <div className={`border-t-2 border-black bg-white ${compact ? "p-2" : "p-3"}`}>
        <div className="flex items-end gap-2">
          <textarea
            value={drafts[room.id] || ""}
            onChange={(event) => setDrafts((current) => ({ ...current, [room.id]: event.target.value }))}
            onKeyDown={(event) => handleComposerKey(event, room.id)}
            placeholder={`Message ${roomTitle(room)}`}
            rows={compact ? 1 : 2}
            className="min-h-11 flex-1 resize-none border-2 border-black bg-white px-3 py-2 text-[16px] text-[#0b4f2a] outline-none focus:border-[#178b43]"
          />
          <button type="button" onClick={() => void send(room.id)} disabled={busyRoomId === room.id} className="min-h-11 border-2 border-black bg-[#178b43] px-4 font-black text-white disabled:opacity-50">Send</button>
        </div>
      </div>
    );
  }

  function ConversationHeader({ room, onClose, compact = false }) {
    const person = roomAvatarPerson(room);
    return (
      <header className={`flex items-center gap-3 border-b-2 border-black bg-[#178b43] text-white ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <Avatar person={person} label={roomTitle(room)} online={person ? onlineUserIds.has(person.id) : false} size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-black">{roomTitle(room)}</h2>
          <p className="truncate text-xs font-semibold text-white">{person && onlineUserIds.has(person.id) ? "Online" : room.room_type === "dm" ? "Messages deliver even while offline" : room.description}</p>
        </div>
        {onClose ? <button type="button" onClick={onClose} aria-label="Close conversation" className="grid h-10 w-10 place-items-center border-2 border-white bg-[#0b4f2a] text-xl font-black text-white">×</button> : null}
      </header>
    );
  }

  if (!payload && !error) {
    return <div className="min-h-[70vh] bg-white p-8 text-center font-black text-[#0b4f2a]">Loading Liberty Chat…</div>;
  }

  return (
    <div className="relative min-h-[calc(100vh-3rem)] bg-white text-[#0b4f2a]">
      {toast ? (
        <button type="button" onClick={() => { const id = toast.roomId; setToast(null); openRoom(id, { mobile: true }); }} className="fixed right-3 top-3 z-[70] w-[min(92vw,360px)] border-2 border-black bg-white p-3 text-left shadow-xl">
          <strong className="block text-sm text-[#0b4f2a]">{toast.title}</strong>
          <span className="mt-1 block text-sm text-black">{toast.message}</span>
          <span className="mt-1 block text-xs font-bold text-[#178b43]">Tap to open {toast.roomName}</span>
        </button>
      ) : null}

      <div className="mx-auto max-w-[1180px] bg-white pb-20 md:grid md:grid-cols-[360px_1fr] md:border-x-2 md:border-black md:pb-0">
        <aside className="min-h-[calc(100vh-3rem)] border-r-0 border-black bg-white md:border-r-2">
          <div className="border-b-2 border-black bg-[#178b43] px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight">messenger</h1>
              <span className="text-2xl font-black" aria-hidden="true">✎</span>
            </div>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Liberty members" className="mt-3 h-12 w-full border-2 border-black bg-white px-3 text-[16px] font-semibold text-[#0b4f2a] outline-none placeholder:text-[#0b4f2a]" />
          </div>

          <div className="border-b-2 border-black bg-white px-3 py-3">
            <div className="flex gap-4 overflow-x-auto pb-1">
              {mainRoom ? (
                <button type="button" onClick={() => openRoom(mainRoom.id, { mobile: true })} className="w-20 shrink-0 text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[#178b43] bg-[#178b43] text-sm font-black text-white">MAIN</span>
                  <span className="mt-1 block truncate text-xs font-black text-[#0b4f2a]">Main Chat</span>
                </button>
              ) : null}
              {filteredPeople.slice(0, 18).map((person) => (
                <button key={person.id} type="button" disabled={busyRoomId === `person:${person.id}`} onClick={() => void startDm(person.id, { mobile: true })} className="w-20 shrink-0 text-center disabled:opacity-50">
                  <span className="mx-auto block w-fit"><Avatar person={person} online={onlineUserIds.has(person.id)} size="lg" /></span>
                  <span className="mt-1 block truncate text-xs font-black text-[#0b4f2a]">{nameFor(person)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y-2 divide-black bg-white">
            {(activeBottomTab === "people" ? [] : recentRooms)
              .filter((room) => {
                if (activeBottomTab === "notifications") return Number(room.unread_count || 0) > 0;
                const query = search.trim().toLowerCase();
                return !query || roomTitle(room).toLowerCase().includes(query) || latestPreview(room).toLowerCase().includes(query);
              })
              .map((room) => {
                const person = roomAvatarPerson(room);
                return (
                  <button key={room.id} type="button" onClick={() => openRoom(room.id, { mobile: true })} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-[#178b43] hover:text-white md:hover:bg-white md:hover:text-[#0b4f2a]">
                    <Avatar person={person} label={roomTitle(room)} online={person ? onlineUserIds.has(person.id) : false} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="truncate text-[16px]">{roomTitle(room)}</strong>
                        <span className="shrink-0 text-xs font-bold">{formatTime(room.latest_message?.created_at || room.updated_at)}</span>
                      </span>
                      <span className={`mt-1 block truncate text-sm ${Number(room.unread_count || 0) ? "font-black" : "font-semibold"}`}>{latestPreview(room)}</span>
                    </span>
                    {Number(room.unread_count || 0) ? <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#178b43] px-1 text-xs font-black text-white">{room.unread_count}</span> : null}
                  </button>
                );
              })}
          </div>

          {activeBottomTab === "people" ? (
            <div className="divide-y-2 divide-black">
              {filteredPeople.map((person) => (
                <button key={person.id} type="button" onClick={() => void startDm(person.id, { mobile: true })} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left">
                  <Avatar person={person} online={onlineUserIds.has(person.id)} />
                  <span className="min-w-0 flex-1"><strong className="block truncate">{nameFor(person)}</strong><span className="block truncate text-sm font-semibold">{person.username ? `@${person.username}` : person.email}</span></span>
                  <span className="border-2 border-black bg-[#178b43] px-3 py-2 text-xs font-black text-white">Message</span>
                </button>
              ))}
            </div>
          ) : null}

          {error ? <div className="m-3 border-2 border-black bg-white p-3 text-sm font-black text-[#8b0000]">{error}</div> : null}

          <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t-2 border-black bg-[#178b43] text-white md:sticky md:bottom-0" aria-label="Chat navigation">
            <button type="button" onClick={() => setActiveBottomTab("chats")} className={`min-h-16 border-r border-black px-2 text-xs font-black ${activeBottomTab === "chats" ? "bg-[#0b4f2a]" : "bg-[#178b43]"}`}>Chats{totalUnread ? ` (${totalUnread})` : ""}</button>
            <button type="button" onClick={() => setActiveBottomTab("people")} className={`min-h-16 border-r border-black px-2 text-xs font-black ${activeBottomTab === "people" ? "bg-[#0b4f2a]" : "bg-[#178b43]"}`}>People</button>
            <button type="button" onClick={() => setActiveBottomTab("notifications")} className={`min-h-16 border-r border-black px-2 text-xs font-black ${activeBottomTab === "notifications" ? "bg-[#0b4f2a]" : "bg-[#178b43]"}`}>Notifications{totalUnread ? ` (${totalUnread})` : ""}</button>
            <Link href="/dashboard" className="grid min-h-16 place-items-center px-2 text-xs font-black">Menu</Link>
          </nav>
        </aside>

        <section className="hidden min-h-[calc(100vh-3rem)] flex-col bg-white md:flex">
          {mainRoom ? (
            <>
              <ConversationHeader room={mainRoom} />
              <MessageList room={mainRoom} />
              <Composer room={mainRoom} />
            </>
          ) : <div className="grid flex-1 place-items-center font-black">Main Chat is unavailable.</div>}
        </section>
      </div>

      {mobileRoomId ? (() => {
        const room = rooms.find((entry) => entry.id === mobileRoomId);
        if (!room) return null;
        return (
          <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
            <ConversationHeader room={room} onClose={() => { setMobileRoomId(""); void load(); }} />
            <MessageList room={room} />
            <Composer room={room} />
          </div>
        );
      })() : null}

      <div className="pointer-events-none fixed bottom-0 right-0 z-40 hidden items-end gap-2 px-3 md:flex">
        {openRoomIds.slice(-3).map((roomId) => {
          const room = rooms.find((entry) => entry.id === roomId);
          if (!room) return null;
          const collapsed = collapsedRoomIds.includes(roomId);
          return (
            <section key={room.id} className="pointer-events-auto flex w-[320px] flex-col border-2 border-black bg-white shadow-2xl">
              <div className="flex items-center border-b-2 border-black bg-[#178b43] text-white">
                <button type="button" onClick={() => setCollapsedRoomIds((current) => current.includes(roomId) ? current.filter((id) => id !== roomId) : [...current, roomId])} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left">
                  <Avatar person={roomAvatarPerson(room)} label={roomTitle(room)} online={roomAvatarPerson(room) ? onlineUserIds.has(roomAvatarPerson(room).id) : false} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-black">{roomTitle(room)}</span>
                  {Number(room.unread_count || 0) ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-1 text-xs font-black text-[#0b4f2a]">{room.unread_count}</span> : null}
                  <span className="font-black">{collapsed ? "□" : "_"}</span>
                </button>
                <button type="button" onClick={() => closeDesktopRoom(room.id)} className="grid h-12 w-12 place-items-center border-l-2 border-black text-xl font-black">×</button>
              </div>
              {!collapsed ? <><div className="flex h-[330px] flex-col"><MessageList room={room} compact /></div><Composer room={room} compact /></> : null}
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-3 right-3 z-30 hidden md:block">
        <div className="flex flex-col items-end gap-2">
          {recentRooms.filter((room) => room.room_type !== "members" && !openRoomIds.includes(room.id) && Number(room.unread_count || 0) > 0).slice(0, 4).map((room) => (
            <button key={room.id} type="button" onClick={() => openRoom(room.id)} className="flex items-center gap-2 border-2 border-black bg-white px-2 py-2 shadow-lg">
              <Avatar person={roomAvatarPerson(room)} label={roomTitle(room)} size="sm" />
              <span className="max-w-36 truncate text-sm font-black text-[#0b4f2a]">{roomTitle(room)}</span>
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#178b43] px-1 text-xs font-black text-white">{room.unread_count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
