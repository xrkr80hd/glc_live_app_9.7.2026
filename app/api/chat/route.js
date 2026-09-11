import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getViewer() {
  const db = await createSupabaseServerClient();
  if (!db) return null;

  const { data: authData, error: authError } = await db.auth.getUser();
  const user = authData?.user;
  if (authError || !user?.id) return null;

  const { data: member, error: memberError } = await db
    .from("team_members")
    .select("id,full_name,username,email,is_superuser,is_active,account_state,auth_user_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .eq("account_state", "active")
    .maybeSingle();

  if (memberError || !member?.id) return null;
  return { db, user, member };
}

function profilePhotoForUser(user) {
  const metadata = user?.user_metadata || {};
  return String(
    metadata.profile_photo_url ||
      metadata.profilePhotoUrl ||
      metadata.avatar_url ||
      metadata.photo_url ||
      metadata.picture ||
      "",
  ).trim();
}

export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in to use chat." }, { status: 401 });

  try {
    const { db, member, user } = viewer;

    const [{ data: rooms, error: roomsError }, { data: people, error: peopleError }] = await Promise.all([
      db
        .from("chat_rooms")
        .select("id,room_key,name,room_type,description,ministry_role_id,is_active,updated_at")
        .eq("is_active", true),
      db
        .from("team_members")
        .select("id,full_name,username,email,is_active,account_state,auth_user_id")
        .eq("is_active", true)
        .eq("account_state", "active")
        .order("full_name"),
    ]);

    if (roomsError) throw roomsError;
    if (peopleError) throw peopleError;

    const roomIds = (rooms || []).map((room) => room.id);
    const [{ data: messages, error: messagesError }, { data: roomMembers, error: roomMembersError }] = await Promise.all([
      roomIds.length
        ? db
            .from("chat_messages")
            .select("id,room_id,sender_member_id,body,created_at,edited_at,deleted_at")
            .in("room_id", roomIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: true })
            .limit(2000)
        : Promise.resolve({ data: [], error: null }),
      roomIds.length
        ? db
            .from("chat_room_members")
            .select("room_id,member_id,can_read,can_post,last_read_at")
            .in("room_id", roomIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (messagesError) throw messagesError;
    if (roomMembersError) throw roomMembersError;

    const hydratedPeople = (people || []).map((person) => ({ ...person, profile_photo_url: "" }));
    const peopleMap = new Map(hydratedPeople.map((person) => [person.id, person]));
    const hydratedMessages = (messages || []).map((message) => ({
      ...message,
      sender: peopleMap.get(message.sender_member_id) || null,
    }));

    const roomSummaries = (rooms || []).map((room) => {
      const membershipRows = (roomMembers || []).filter((row) => row.room_id === room.id);
      const mine = membershipRows.find((row) => row.member_id === member.id);
      const roomMessages = hydratedMessages.filter((message) => message.room_id === room.id);
      const latest = roomMessages[roomMessages.length - 1] || null;
      const threshold = mine?.last_read_at ? new Date(mine.last_read_at).getTime() : 0;
      const unreadCount = roomMessages.filter(
        (message) => message.sender_member_id !== member.id && new Date(message.created_at).getTime() > threshold,
      ).length;

      return {
        ...room,
        participant_ids: room.room_type === "dm" ? membershipRows.map((row) => row.member_id) : [],
        last_read_at: mine?.last_read_at || null,
        can_post: mine?.can_post !== false,
        unread_count: unreadCount,
        latest_message: latest,
      };
    });

    roomSummaries.sort((a, b) => {
      if (a.room_type === "members") return -1;
      if (b.room_type === "members") return 1;
      const aTime = new Date(a.latest_message?.created_at || a.updated_at || 0).getTime();
      const bTime = new Date(b.latest_message?.created_at || b.updated_at || 0).getTime();
      return bTime - aTime;
    });

    return NextResponse.json({
      me: { ...member, profile_photo_url: profilePhotoForUser(user) },
      rooms: roomSummaries,
      people: hydratedPeople,
      messages: hydratedMessages,
    });
  } catch (error) {
    console.error("Liberty chat GET failed", error);
    return NextResponse.json({ error: error?.message || "Unable to load chat." }, { status: 500 });
  }
}

export async function POST(request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in to use chat." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "");
  const { db, member } = viewer;

  try {
    if (action === "start-dm") {
      const otherId = String(body?.memberId || "").trim();
      if (!otherId || otherId === member.id) {
        return NextResponse.json({ error: "Choose another member." }, { status: 400 });
      }
      const { data, error } = await db.rpc("liberty_start_dm", { other_member_id: otherId });
      if (error) throw error;
      return NextResponse.json({ roomId: data });
    }

    const roomId = String(body?.roomId || "").trim();
    if (!roomId) return NextResponse.json({ error: "Chat room required." }, { status: 400 });

    if (action === "send") {
      const text = String(body?.message || "").trim();
      if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
      if (text.length > 4000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

      const { data, error } = await db
        .from("chat_messages")
        .insert({ room_id: roomId, sender_member_id: member.id, body: text })
        .select("id,created_at")
        .single();
      if (error) throw error;

      await db.from("chat_room_members").upsert(
        {
          room_id: roomId,
          member_id: member.id,
          can_read: true,
          can_post: true,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "room_id,member_id" },
      );

      return NextResponse.json({ ok: true, message: data });
    }

    if (action === "mark-read") {
      const { error } = await db.from("chat_room_members").upsert(
        {
          room_id: roomId,
          member_id: member.id,
          can_read: true,
          can_post: true,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "room_id,member_id" },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "edit") {
      const messageId = Number(body?.messageId);
      const text = String(body?.message || "").trim();
      if (!Number.isFinite(messageId) || !text) {
        return NextResponse.json({ error: "Message required." }, { status: 400 });
      }
      const { error } = await db
        .from("chat_messages")
        .update({ body: text, edited_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("sender_member_id", member.id)
        .eq("room_id", roomId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const messageId = Number(body?.messageId);
      if (!Number.isFinite(messageId)) {
        return NextResponse.json({ error: "Message required." }, { status: 400 });
      }
      const { error } = await db
        .from("chat_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("sender_member_id", member.id)
        .eq("room_id", roomId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported chat action." }, { status: 400 });
  } catch (error) {
    console.error("Liberty chat POST failed", error);
    return NextResponse.json({ error: error?.message || "Unable to update chat." }, { status: 500 });
  }
}
