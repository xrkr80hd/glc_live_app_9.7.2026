import { NextResponse } from "next/server";
import { buildPublicUrl } from "@/lib/public-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectTo(request, path) {
  return NextResponse.redirect(buildPublicUrl(request, path));
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/member-access?verified=1";

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return redirectTo(request, "/member-access?error=verification");
  }

  let authError = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    authError = error;
  } else {
    authError = new Error("Missing verification token.");
  }

  if (authError) {
    return redirectTo(request, "/member-access?error=verification");
  }

  await supabase.auth.signOut();

  return redirectTo(request, next);
}
