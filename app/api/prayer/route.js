import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithStatus(request, status) {
  return NextResponse.redirect(new URL(`/prayer?status=${status}`, request.url), {
    status: 303,
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const prayerRequest = String(formData.get("request") || "").trim();
  const isPrivate = String(formData.get("is_private") || "") === "true";

  if (!name || !email || !prayerRequest) {
    return redirectWithStatus(request, "missing");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return redirectWithStatus(request, "not_configured");
  }

  const { error } = await supabase.from("prayer_requests").insert({
    name,
    email,
    phone: phone || null,
    request_text: prayerRequest,
    is_private: isPrivate,
  });

  if (error) {
    return redirectWithStatus(request, "error");
  }

  return redirectWithStatus(request, "submitted");
}
