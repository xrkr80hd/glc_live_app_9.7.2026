import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdminSession, requireAdminSupabase } from "@/lib/admin-api";

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

  return "bin";
}

async function ensureBucketExists(supabase, bucket) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return { error: listError };
  }

  if (Array.isArray(buckets) && buckets.some((entry) => entry?.name === bucket)) {
    return { error: null };
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
  });

  if (createError && !String(createError.message || "").toLowerCase().includes("already")) {
    return { error: createError };
  }

  return { error: null };
}

export async function POST(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid upload form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const maxUploadBytes = Number.parseInt(process.env.ADMIN_UPLOAD_MAX_BYTES || "120000000", 10);
  const maxBytes = Number.isFinite(maxUploadBytes) && maxUploadBytes > 0 ? maxUploadBytes : 120000000;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File is too large. Max size is ${Math.floor(maxBytes / 1024 / 1024)}MB.` },
      { status: 400 },
    );
  }

  const bucket = sanitizePathSegment(formData.get("bucket"), process.env.SUPABASE_MEDIA_BUCKET || "church-media");
  const folder = sanitizePathSegment(formData.get("folder"), "uploads");
  const extension = inferExtension(file.name, file.type);
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const { error: bucketError } = await ensureBucketExists(supabase, bucket);
  if (bucketError) {
    return NextResponse.json({ error: bucketError.message || "Unable to access media bucket" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 400 });
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return NextResponse.json({
    bucket,
    path: objectPath,
    url: publicUrlData?.publicUrl || "",
  });
}
