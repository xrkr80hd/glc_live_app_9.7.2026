import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      requestText: String(body.request || body.request_text || "").trim(),
      sharePermission: Boolean(body.sharePermission),
    };
  }

  const formData = await request.formData();
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    requestText: String(formData.get("request") || formData.get("request_text") || "").trim(),
    sharePermission:
      String(formData.get("sharePermission") || "").toLowerCase() === "yes" ||
      String(formData.get("is_private") || "") !== "true",
  };
}

function normalizeName(value) {
  return value || "Anonymous";
}

function normalizeEmail(value) {
  return value || "not-provided@golibertychurch.com";
}

export async function POST(request) {
  const payload = await readPayload(request);

  if (!payload.requestText) {
    return NextResponse.json(
      {
        success: false,
        message: "Please let us know how we can pray with you.",
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase is not configured yet.",
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("prayer_requests").insert({
    name: normalizeName(payload.name),
    email: normalizeEmail(payload.email),
    request_text: payload.requestText,
    is_private: !payload.sharePermission,
    status: "new",
  });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "We could not send your request. Please try again soon.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Thank you for sharing. Our prayer team is on it.",
  });
}
