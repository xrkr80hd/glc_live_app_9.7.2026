import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithStatus(request, status) {
  return NextResponse.redirect(new URL(`/visit?status=${status}`, request.url), {
    status: 303,
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const preferredService = String(formData.get("preferred_service") || "").trim();
  const partySizeRaw = Number.parseInt(String(formData.get("party_size") || "1"), 10);
  const message = String(formData.get("message") || "").trim();

  if (!name || !email) {
    return redirectWithStatus(request, "missing");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return redirectWithStatus(request, "not_configured");
  }

  const partySize = Number.isFinite(partySizeRaw) && partySizeRaw > 0 ? partySizeRaw : 1;
  const { error } = await supabase.from("visit_requests").insert({
    name,
    email,
    phone: phone || null,
    preferred_service: preferredService || null,
    party_size: partySize,
    message: message || null,
  });

  if (error) {
    return redirectWithStatus(request, "error");
  }

  return redirectWithStatus(request, "submitted");
}
