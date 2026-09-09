"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getKakaoAuthStatus } from "@/lib/auth/providers";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { createClient } from "@/lib/supabase/server";

function getSiteOrigin(headerList: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost ?? headerList.get("host");
  const proto =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

export async function startKakaoLogin(formData: FormData) {
  const status = getKakaoAuthStatus();
  if (!status.enabled) {
    redirect(`/?error=kakao_not_configured`);
  }

  const returnTo = sanitizeReturnTo(String(formData.get("returnTo") ?? ""));
  const headerList = await headers();
  const origin = getSiteOrigin(headerList);
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect(`/?error=oauth_start_failed`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?loggedOut=1");
}
