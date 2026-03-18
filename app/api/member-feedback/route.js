import { NextResponse } from "next/server";
import { requireMemberSession } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value, maxLength = 0) {
  const normalized = String(value || "").trim();
  if (!maxLength) {
    return normalized;
  }
  return normalized.slice(0, maxLength);
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return {
      name: normalizeText(body.name, 120),
      email: normalizeText(body.email, 160),
      route: normalizeText(body.route, 160),
      category: normalizeText(body.category, 40),
      severity: normalizeText(body.severity, 40),
      message: normalizeText(body.message, 4000),
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
    name: normalizeText(formData.get("name"), 120),
    email: normalizeText(formData.get("email"), 160),
    route: normalizeText(formData.get("route"), 160),
    category: normalizeText(formData.get("category"), 40),
    severity: normalizeText(formData.get("severity"), 40),
    message: normalizeText(formData.get("message"), 4000),
  };
}

export async function POST(request) {
  const { member, user, error: sessionError } = await requireMemberSession();
  if (sessionError) {
    return sessionError;
  }

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

  if (!payload.message) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter the issue or feedback note.",
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

  const category = ["bug", "ui", "idea", "other"].includes(payload.category)
    ? payload.category
    : "bug";
  const severity = ["low", "medium", "high"].includes(payload.severity)
    ? payload.severity
    : "medium";

  const { error } = await supabase.from("member_feedback").insert({
    member_id: member.id,
    name: payload.name || member.full_name || user.user_metadata?.full_name || null,
    email: payload.email || member.email || user.email || null,
    route: payload.route || null,
    category,
    severity,
    message: payload.message,
  });

  if (error) {
    const tableMissing = error.code === "42P01";
    return NextResponse.json(
      {
        success: false,
        message: tableMissing
          ? "Feedback table is not set up yet. Please run the member feedback migration."
          : "Unable to save feedback right now. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Thanks. Your test feedback has been saved.",
  });
}
