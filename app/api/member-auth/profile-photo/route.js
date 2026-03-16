import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireMemberSession } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizePathSegment(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^\/+|\/+$/g, "");
  return normalized || fallback;
}

function inferExtension(fileName, mimeType) {
  const fileExt = String(fileName || "").split(".").pop()?.trim().toLowerCase();
  if (fileExt && /^[a-z0-9]{1,8}$/.test(fileExt)) {
    return fileExt;
  }

  const mime = String(mimeType || "").toLowerCase();
  if (mime.includes("/")) {
    const ext = mime.split("/")[1]?.replace(/[^a-z0-9]/g, "");
    if (ext) {
      return ext;
    }
  }

  return "jpg";
}

async function ensureBucketExists(supabase, bucket) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return listError;
  }

  if (Array.isArray(buckets) && buckets.some((entry) => entry?.name === bucket)) {
    return null;
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, { public: true });
  if (createError && !String(createError.message || "").toLowerCase().includes("already")) {
    return createError;
  }

  return null;
}

export async function POST(request) {
  const { member, user, error } = await requireMemberSession();
  if (error) {
    return error;
  }

  const adminSupabase = createSupabaseAdminClient();
  const sessionSupabase = await createSupabaseServerClient();
  if (!adminSupabase || !sessionSupabase) {
    return NextResponse.json({ success: false, message: "Supabase is not configured yet." }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ success: false, message: "Invalid upload form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "A profile photo file is required." }, { status: 400 });
  }

  if (!String(file.type || "").startsWith("image/")) {
    return NextResponse.json({ success: false, message: "Please upload an image file." }, { status: 400 });
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ success: false, message: "Please keep profile photos under 8MB." }, { status: 400 });
  }

  const bucket = sanitizePathSegment(process.env.SUPABASE_MEDIA_BUCKET || "church-media", "church-media");
  const folder = `member-profile-photos/${sanitizePathSegment(member?.id || user?.id, "member")}`;
  const extension = inferExtension(file.name, file.type);
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const bucketError = await ensureBucketExists(adminSupabase, bucket);
  if (bucketError) {
    return NextResponse.json({ success: false, message: "Unable to access the media bucket right now." }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await adminSupabase.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message || "Unable to upload photo." }, { status: 400 });
  }

  const { data: publicUrlData } = adminSupabase.storage.from(bucket).getPublicUrl(objectPath);
  const photoUrl = publicUrlData?.publicUrl || "";
  if (!photoUrl) {
    return NextResponse.json({ success: false, message: "Photo uploaded, but the public URL could not be created." }, { status: 500 });
  }

  const { error: authUpdateError } = await sessionSupabase.auth.updateUser({
    data: {
      ...(user?.user_metadata || {}),
      profile_photo_url: photoUrl,
    },
  });

  if (authUpdateError) {
    return NextResponse.json({ success: false, message: "Photo uploaded, but we could not save it to your profile." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    url: photoUrl,
    message: "Your profile photo has been saved.",
  });
}
