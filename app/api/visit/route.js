import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parsePartySize(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return 1;
  }
  if (raw.includes("+")) {
    const parsed = Number.parseInt(raw.replace("+", ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      date: String(body.date || "").trim(),
      party: String(body.party || body.party_size || "").trim(),
      notes: String(body.notes || body.message || "").trim(),
    };
  }

  if (
    !contentType.includes("multipart/form-data") &&
    !contentType.includes("application/x-www-form-urlencoded")
  ) {
    const error = new Error("Unsupported content type");
    error.name = "UnsupportedContentType";
    throw error;
  }

  const formData = await request.formData();
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    party: String(formData.get("party") || formData.get("party_size") || "").trim(),
    notes: String(formData.get("notes") || formData.get("message") || "").trim(),
  };
}

export async function POST(request) {
  let payload;
  try {
    payload = await readPayload(request);
  } catch (error) {
    if (error?.name === "UnsupportedContentType") {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported content type. Use JSON or form data.",
        },
        { status: 415 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request payload.",
      },
      { status: 400 },
    );
  }

  if (!payload.name || !payload.email) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter your name and email.",
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase is not configured yet.",
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("visit_requests").insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    preferred_service: payload.date || null,
    party_size: parsePartySize(payload.party),
    message: payload.notes || null,
  });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to send right now. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Thanks — your visit request has been received.",
  });
}
