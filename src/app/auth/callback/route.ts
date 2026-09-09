import { NextResponse } from "next/server";

import { ensureProfile } from "@/lib/auth/ensure-profile";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");
  const next = sanitizeReturnTo(searchParams.get("next"));

  const noStoreHeaders = {
    "Cache-Control": "private, no-store",
  };

  if (oauthError) {
    const message =
      oauthError === "access_denied"
        ? "login_cancelled"
        : "oauth_callback_error";
    const url = new URL("/", origin);
    url.searchParams.set("error", message);
    if (oauthDescription) {
      url.searchParams.set("detail", "provider");
    }
    return NextResponse.redirect(url, { headers: noStoreHeaders });
  }

  if (!code) {
    const url = new URL("/", origin);
    url.searchParams.set("error", "missing_auth_code");
    return NextResponse.redirect(url, { headers: noStoreHeaders });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/auth/error", origin);
    url.searchParams.set("error", "session_exchange_failed");
    return NextResponse.redirect(url, { headers: noStoreHeaders });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfile(supabase, user);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`, {
      headers: noStoreHeaders,
    });
  }

  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`, {
      headers: noStoreHeaders,
    });
  }

  return NextResponse.redirect(`${origin}${next}`, {
    headers: noStoreHeaders,
  });
}
