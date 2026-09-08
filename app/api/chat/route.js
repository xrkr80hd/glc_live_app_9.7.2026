import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function bearerToken(request) {
  return String(request.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

async function getViewer(request) {
  const token = bearerToken(request);
  if (!token) return null;
  const db = createSupabaseAdminClient();
  if (!db) return null;
  const { data: authData, error: authError } = await db.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user?.id) return null;
  const { data: member } = await db
    .from("team_members")
    .select("id,full_name,username,email,is_superuser,is_active,account_state,auth_user_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!member?.id) return null;
  const { data: assignments } = await db
    .from("team_member_roles")
    .select("role_id,team_roles(role_key,name)")
    .eq("member_id", member.id);
  const roles = (assignments || [])
    .map((row) => row.team_roles)
    .filter(Boolean);
  return {
    db,
    member,
    roleIds: new Set((assignments || []).map((row) => row.role_id).filter(Boolean)),
    roleKeys: new Set(roles.map((role) => String(role.role_key || "").toLowerCase())),
  };
}

function canUseRoom(viewer, room, roleRows = [], memberRows = []) {
  if (!room?.is_active) return false;
  if (viewer.member.is_superuser) return true;
  if (room.room_type === "members") return true;
  if (room.room_type === "pastoral") return viewer.roleKeys.has("pastor");
  if (room.room_type === "leadership") {
    if (viewer.roleKeys.has("pastor")) return true;
    return roleRows.some((row) => viewer.roleIds.has(row.role_id) && row.can_read !== false);
  }
  if (room.room_type === "ministry") {
    if (viewer.roleKeys.has("pastor")) return true;
    if (room.ministry_role_id && viewer.roleIds.has(room.ministry_role_id)) return true;
    return roleRows.some((row) => viewer.roleIds.has(row.role_id) && row.can_read !== false);
  }
  if (room.room_type === "dm") {
    return memberRows.some((row) => row.member_id === viewer.member.id && row.can_read !== false);
  }
  return false;
}

async function loadRooms(viewer) {
  const { db } = viewer;
  const { data: rooms, error } = await db
    .from("chat_rooms")
    .select("id,room_key,name,room_type,description,ministry_role_id,is_active,updated_at")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  const roomIds = (rooms || []).map((room) => room.id);
  const [{ data: roleRows }, { data: memberRows }] = await Promise.all([
    roomIds.length
      ? db.from("chat_room_roles").select("room_id,role_id,can_read,can_post").in("room_id", roomIds)
      : Promise.resolve({ data: [] }),
    roomIds.length
      ? db.from("chat_room_members").select("room_id,member_id,can_read,can_post,last_read_at").in("room_id", roomIds)
      : Promise.resolve({ data: [] }),
  ]);
  return (rooms || []).filter((room) => canUseRoom(
    viewer,
    room,
    (roleRows || []).filter((row) => row.room_id === room.id),
    (memberRows || []).filter((row) => row.room_id === room.id),
  ));
}

export async function GET(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in to use chat." }, { status: 401 });
  try {
    const rooms = await loadRooms(viewer);
    const roomIds = rooms.map((room) => room.id);
    const [{ data: messages }, { data: people }] = await Promise.all([
      roomIds.length
        ? viewer.db
            .from("chat_messages")
            .select("id,room_id,sender_member_id,body,created_at,edited_at,deleted_at")
            .in("room_id", roomIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: true })
            .limit(1200)
        : Promise.resolve({ data: [] }),
      viewer.db
        .from("team_members")
        .select("id,full_name,username,email,is_active")
        .eq("is_active", true)
        .order("full_name"),
    ]);
    const peopleMap = new Map((people || []).map((person) => [person.id, person]));
    const hydratedMessages = (messages || []).map((message) => ({
      ...message,
      sender: peopleMap.get(message.sender_member_id) || null,
    }));
    return NextResponse.json({
      me: viewer.member,
      rooms,
      people: people || [],
      messages: hydratedMessages,
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load chat." }, { status: 500 });
  }
}

export async function POST(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in to use chat." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "");
  try {
    if (action === "start-dm") {
      const otherId = String(body?.memberId || "").trim();
      if (!otherId || otherId === viewer.member.id) {
        return NextResponse.json({ error: "Choose another member." }, { status: 400 });
      }
      const { data: other } = await viewer.db
        .from("team_members")
        .select("id,full_name,is_active")
        .eq("id", otherId)
        .eq("is_active", true)
        .maybeSingle();
      if (!other?.id) return NextResponse.json({ error: "Member not found." }, { status: 404 });
      const ids = [viewer.member.id, other.id].sort();
      const roomKey = `dm_${ids.join("_").replaceAll("-", "")}`;
      let { data: room } = await viewer.db.from("chat_rooms").select("id").eq("room_key", roomKey).maybeSingle();
      if (!room) {
        const created = await viewer.db
          .from("chat_rooms")
          .insert({ room_key: roomKey, name: other.full_name || "Direct Message", room_type: "dm", created_by_member_id: viewer.member.id })
          .select("id")
          .single();
        if (created.error) throw created.error;
        room = created.data;
        const { error: participantError } = await viewer.db.from("chat_room_members").insert(ids.map((memberId) => ({ room_id: room.id, member_id: memberId })));
        if (participantError) throw participantError;
      }
      return NextResponse.json({ roomId: room.id });
    }

    const roomId = String(body?.roomId || "").trim();
    if (!roomId) return NextResponse.json({ error: "Chat room required." }, { status: 400 });
    const rooms = await loadRooms(viewer);
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return NextResponse.json({ error: "You do not have access to this chat." }, { status: 403 });

    if (action === "send") {
      const text = String(body?.message || "").trim();
      if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
      if (text.length > 4000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });
      const { data, error } = await viewer.db
        .from("chat_messages")
        .insert({ room_id: roomId, sender_member_id: viewer.member.id, body: text })
        .select("id,created_at")
        .single();
      if (error) throw error;
      await viewer.db.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", roomId);
      return NextResponse.json({ ok: true, message: data });
    }

    if (action === "mark-read") {
      await viewer.db.from("chat_room_members").upsert({
        room_id: roomId,
        member_id: viewer.member.id,
        last_read_at: new Date().toISOString(),
      }, { onConflict: "room_id,member_id" });
      return NextResponse.json({ ok: true });
    }

    if (action === "edit") {
      const messageId = Number(body?.messageId);
      const text = String(body?.message || "").trim();
      if (!Number.isFinite(messageId) || !text) return NextResponse.json({ error: "Message required." }, { status: 400 });
      const { data: existing } = await viewer.db.from("chat_messages").select("id,sender_member_id").eq("id", messageId).eq("room_id", roomId).maybeSingle();
      if (!existing || (existing.sender_member_id !== viewer.member.id && !viewer.member.is_superuser)) {
        return NextResponse.json({ error: "You can only edit your own messages." }, { status: 403 });
      }
      const { error } = await viewer.db.from("chat_messages").update({ body: text, edited_at: new Date().toISOString() }).eq("id", messageId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const messageId = Number(body?.messageId);
      const { data: existing } = await viewer.db.from("chat_messages").select("id,sender_member_id").eq("id", messageId).eq("room_id", roomId).maybeSingle();
      if (!existing || (existing.sender_member_id !== viewer.member.id && !viewer.member.is_superuser)) {
        return NextResponse.json({ error: "You can only delete your own messages." }, { status: 403 });
      }
      const { error } = await viewer.db.from("chat_messages").update({ deleted_at: new Date().toISOString() }).eq("id", messageId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported chat action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Chat action failed." }, { status: 500 });
  }
}
