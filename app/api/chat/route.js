import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";

function bearerToken(request) {
  return String(request.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

async function resolveMemberFromBearer(db, request) {
  const token = bearerToken(request);
  if (!token) return null;
  const { data: authData, error: authError } = await db.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user?.id) return null;
  const { data: member } = await db
    .from("team_members")
    .select("id,full_name,username,email,is_superuser,is_active,account_state,auth_user_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .eq("account_state", "active")
    .maybeSingle();
  return member?.id ? { member, user } : null;
}

async function getViewer(request) {
  const db = createSupabaseAdminClient();
  if (!db) return null;

  let member = null;
  let user = null;

  try {
    const current = await getCurrentMemberFromServerCookies();
    if (current?.member?.id) {
      member = current.member;
      user = current.user;
    }
  } catch {
    // Bearer fallback below keeps older clients working.
  }

  if (!member?.id) {
    const bearer = await resolveMemberFromBearer(db, request);
    member = bearer?.member || null;
    user = bearer?.user || null;
  }

  if (!member?.id || member.is_active === false) return null;

  const { data: assignments } = await db
    .from("team_member_roles")
    .select("role_id,is_role_admin,team_roles(role_key,name)")
    .eq("member_id", member.id);
  const roles = (assignments || []).map((row) => row.team_roles).filter(Boolean);

  return {
    db,
    user,
    member,
    roleIds: new Set((assignments || []).map((row) => row.role_id).filter(Boolean)),
    roleKeys: new Set(roles.map((role) => String(role.role_key || "").toLowerCase())),
  };
}

function roomAccess(viewer, room, roleRows = [], memberRows = []) {
  if (!room?.is_active) return { canRead: false, canPost: false };
  if (viewer.member.is_superuser) return { canRead: true, canPost: true };
  if (room.room_type === "members") return { canRead: true, canPost: true };

  const isPastoral = viewer.roleKeys.has("pastor") || viewer.roleKeys.has("associate_pastor");
  if (room.room_type === "pastoral") return { canRead: isPastoral, canPost: isPastoral };

  const matchingRoleRows = roleRows.filter((row) => viewer.roleIds.has(row.role_id));
  const matchingMember = memberRows.find((row) => row.member_id === viewer.member.id);

  if (room.room_type === "leadership") {
    if (isPastoral) return { canRead: true, canPost: true };
    return {
      canRead: matchingRoleRows.some((row) => row.can_read !== false) || Boolean(matchingMember?.can_read),
      canPost: matchingRoleRows.some((row) => row.can_post !== false) || Boolean(matchingMember?.can_post),
    };
  }

  if (room.room_type === "ministry") {
    if (isPastoral) return { canRead: true, canPost: true };
    const ownsMinistryRole = Boolean(room.ministry_role_id && viewer.roleIds.has(room.ministry_role_id));
    const ministryGrant = matchingRoleRows.find((row) => row.role_id === room.ministry_role_id);
    return {
      canRead: ownsMinistryRole || matchingRoleRows.some((row) => row.can_read !== false) || Boolean(matchingMember?.can_read),
      canPost: ownsMinistryRole
        ? ministryGrant?.can_post !== false
        : matchingRoleRows.some((row) => row.can_post !== false) || Boolean(matchingMember?.can_post),
    };
  }

  if (room.room_type === "dm") {
    return {
      canRead: Boolean(matchingMember?.can_read),
      canPost: Boolean(matchingMember?.can_post),
    };
  }

  return { canRead: false, canPost: false };
}

async function loadRoomAccess(viewer) {
  const { db } = viewer;
  const { data: rooms, error } = await db
    .from("chat_rooms")
    .select("id,room_key,name,room_type,description,ministry_role_id,is_active,updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });
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

  return (rooms || []).map((room) => {
    const roomMembers = (memberRows || []).filter((row) => row.room_id === room.id);
    const access = roomAccess(
      viewer,
      room,
      (roleRows || []).filter((row) => row.room_id === room.id),
      roomMembers,
    );
    const mine = roomMembers.find((row) => row.member_id === viewer.member.id);
    return {
      room: {
        ...room,
        participant_ids: room.room_type === "dm" ? roomMembers.map((row) => row.member_id) : [],
        last_read_at: mine?.last_read_at || null,
      },
      ...access,
    };
  });
}

function profilePhotoForAuthUser(user) {
  const metadata = user?.user_metadata || {};
  return String(
    metadata.profile_photo_url ||
    metadata.profilePhotoUrl ||
    metadata.avatar_url ||
    metadata.photo_url ||
    metadata.picture ||
    ""
  ).trim();
}

export async function GET(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in to use chat." }, { status: 401 });

  try {
    const roomAccessRows = await loadRoomAccess(viewer);
    const rooms = roomAccessRows
      .filter((entry) => entry.canRead)
      .map((entry) => ({ ...entry.room, can_post: entry.canPost }));
    const roomIds = rooms.map((room) => room.id);

    const [{ data: messages }, { data: people }, authResult] = await Promise.all([
      roomIds.length
        ? viewer.db
            .from("chat_messages")
            .select("id,room_id,sender_member_id,body,created_at,edited_at,deleted_at")
            .in("room_id", roomIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: true })
            .limit(2000)
        : Promise.resolve({ data: [] }),
      viewer.db
        .from("team_members")
        .select("id,full_name,username,email,is_active,account_state,auth_user_id")
        .eq("is_active", true)
        .eq("account_state", "active")
        .order("full_name"),
      viewer.db.auth.admin.listUsers({ page: 1, perPage: 1000 }).catch(() => ({ data: { users: [] } })),
    ]);

    const authUsers = authResult?.data?.users || [];
    const authMap = new Map(authUsers.map((authUser) => [authUser.id, authUser]));
    const hydratedPeople = (people || []).map((person) => ({
      ...person,
      profile_photo_url: profilePhotoForAuthUser(authMap.get(person.auth_user_id)),
    }));
    const peopleMap = new Map(hydratedPeople.map((person) => [person.id, person]));
    const hydratedMessages = (messages || []).map((message) => ({
      ...message,
      sender: peopleMap.get(message.sender_member_id) || null,
    }));

    const roomSummaries = rooms.map((room) => {
      const roomMessages = hydratedMessages.filter((message) => message.room_id === room.id);
      const latest = roomMessages[roomMessages.length - 1] || null;
      const threshold = room.last_read_at ? new Date(room.last_read_at).getTime() : 0;
      const unreadCount = roomMessages.filter((message) =>
        message.sender_member_id !== viewer.member.id && new Date(message.created_at).getTime() > threshold
      ).length;
      return {
        ...room,
        unread_count: unreadCount,
        latest_message: latest,
      };
    });

    return NextResponse.json({
      me: {
        ...viewer.member,
        profile_photo_url: profilePhotoForAuthUser(viewer.user || authMap.get(viewer.member.auth_user_id)),
      },
      rooms: roomSummaries,
      people: hydratedPeople,
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
        .select("id,full_name,is_active,account_state")
        .eq("id", otherId)
        .eq("is_active", true)
        .eq("account_state", "active")
        .maybeSingle();
      if (!other?.id) return NextResponse.json({ error: "Member not found." }, { status: 404 });

      const ids = [viewer.member.id, other.id].sort();
      const roomKey = `dm_${ids.join("_").replaceAll("-", "")}`;
      let { data: room } = await viewer.db.from("chat_rooms").select("id").eq("room_key", roomKey).maybeSingle();

      if (!room) {
        const created = await viewer.db
          .from("chat_rooms")
          .insert({
            room_key: roomKey,
            name: "Direct Message",
            room_type: "dm",
            created_by_member_id: viewer.member.id,
          })
          .select("id")
          .single();
        if (created.error) throw created.error;
        room = created.data;
        const { error: participantError } = await viewer.db
          .from("chat_room_members")
          .insert(ids.map((memberId) => ({
            room_id: room.id,
            member_id: memberId,
            can_read: true,
            can_post: true,
            last_read_at: memberId === viewer.member.id ? new Date().toISOString() : null,
          })));
        if (participantError) throw participantError;
      }

      return NextResponse.json({ roomId: room.id });
    }

    const roomId = String(body?.roomId || "").trim();
    if (!roomId) return NextResponse.json({ error: "Chat room required." }, { status: 400 });

    const roomAccessRows = await loadRoomAccess(viewer);
    const accessEntry = roomAccessRows.find((entry) => entry.room.id === roomId);
    if (!accessEntry?.canRead) {
      return NextResponse.json({ error: "You do not have access to this chat." }, { status: 403 });
    }

    if (action === "send") {
      if (!accessEntry.canPost) {
        return NextResponse.json({ error: "You can read this chat, but posting is not enabled for your role." }, { status: 403 });
      }
      const text = String(body?.message || "").trim();
      if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
      if (text.length > 4000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

      const { data, error } = await viewer.db
        .from("chat_messages")
        .insert({ room_id: roomId, sender_member_id: viewer.member.id, body: text })
        .select("id,created_at")
        .single();
      if (error) throw error;

      const now = new Date().toISOString();
      await Promise.all([
        viewer.db.from("chat_rooms").update({ updated_at: now }).eq("id", roomId),
        viewer.db.from("chat_room_members").upsert({
          room_id: roomId,
          member_id: viewer.member.id,
          can_read: true,
          can_post: true,
          last_read_at: now,
        }, { onConflict: "room_id,member_id" }),
      ]);

      return NextResponse.json({ ok: true, message: data });
    }

    if (action === "mark-read") {
      const now = new Date().toISOString();
      const existing = accessEntry.room.room_type === "dm";
      await viewer.db.from("chat_room_members").upsert({
        room_id: roomId,
        member_id: viewer.member.id,
        ...(existing ? {} : { can_read: true, can_post: accessEntry.canPost }),
        last_read_at: now,
      }, { onConflict: "room_id,member_id" });
      return NextResponse.json({ ok: true });
    }

    if (action === "edit") {
      if (!accessEntry.canPost) return NextResponse.json({ error: "Posting is not enabled for your role." }, { status: 403 });
      const messageId = Number(body?.messageId);
      const text = String(body?.message || "").trim();
      if (!Number.isFinite(messageId) || !text) return NextResponse.json({ error: "Message required." }, { status: 400 });
      const { data: existing } = await viewer.db
        .from("chat_messages")
        .select("id,sender_member_id")
        .eq("id", messageId)
        .eq("room_id", roomId)
        .maybeSingle();
      if (!existing || (existing.sender_member_id !== viewer.member.id && !viewer.member.is_superuser)) {
        return NextResponse.json({ error: "You can only edit your own messages." }, { status: 403 });
      }
      const { error } = await viewer.db
        .from("chat_messages")
        .update({ body: text, edited_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const messageId = Number(body?.messageId);
      const { data: existing } = await viewer.db
        .from("chat_messages")
        .select("id,sender_member_id")
        .eq("id", messageId)
        .eq("room_id", roomId)
        .maybeSingle();
      if (!existing || (existing.sender_member_id !== viewer.member.id && !viewer.member.is_superuser)) {
        return NextResponse.json({ error: "You can only delete your own messages." }, { status: 403 });
      }
      const { error } = await viewer.db
        .from("chat_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported chat action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Chat action failed." }, { status: 500 });
  }
}
