import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "로그인이 필요합니다.",
          retryable: false,
        },
      },
      {
        status: 401,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, display_name, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: dataAccount } = await supabase
    .from("data_accounts")
    .select("balance_mb, total_charged_mb, version, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      data: {
        user: {
          id: user.id,
          email: user.email ?? null,
          providers: user.app_metadata?.providers ?? [],
        },
        profile: profile ?? null,
        dataAccount: dataAccount
          ? {
              balanceMb: dataAccount.balance_mb,
              totalChargedMb: dataAccount.total_charged_mb,
              version: dataAccount.version,
              updatedAt: dataAccount.updated_at,
              source: "APP_DB",
            }
          : {
              balanceMb: 0,
              totalChargedMb: 0,
              version: 0,
              updatedAt: null,
              source: "APP_DB",
            },
        esim: {
          status: "UNKNOWN",
          note: "eSIM 배정은 이후 단계에서 연결됩니다.",
        },
      },
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
