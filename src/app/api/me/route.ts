import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

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
        headers: noStore,
      },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_LOOKUP_FAILED",
          message: "프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          retryable: true,
        },
      },
      {
        status: 503,
        headers: noStore,
      },
    );
  }

  const { data: dataAccount, error: dataAccountError } = await supabase
    .from("data_accounts")
    .select("balance_mb, total_charged_mb, version, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dataAccountError) {
    return NextResponse.json(
      {
        error: {
          code: "DATA_ACCOUNT_LOOKUP_FAILED",
          message: "데이터 잔액을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          retryable: true,
        },
      },
      {
        status: 503,
        headers: noStore,
      },
    );
  }

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
              // Successful empty result: row not created yet (e.g. migration lag).
              balanceMb: 0,
              totalChargedMb: 0,
              version: 0,
              updatedAt: null,
              source: "APP_DB",
              provisional: true,
            },
        esim: {
          status: "UNKNOWN",
          note: "eSIM 배정은 이후 단계에서 연결됩니다.",
        },
      },
    },
    {
      headers: noStore,
    },
  );
}
