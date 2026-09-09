import { LogoutButton } from "@/components/auth/logout-button";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await ensureProfile(supabase, user);

  const { data: dataAccount } = await supabase
    .from("data_accounts")
    .select("balance_mb, total_charged_mb, version")
    .eq("user_id", user.id)
    .maybeSingle();

  const balanceMb = dataAccount?.balance_mb ?? 0;
  const displayName =
    profile?.display_name ?? user.email ?? `사용자 ${user.id.slice(0, 8)}`;

  return (
    <main className="dashboard">
      <header className="dashboard-top">
        <div>
          <p className="brand">Trainton</p>
          <p className="account-line">로그인 계정 · {displayName}</p>
        </div>
        <LogoutButton />
      </header>

      <section className="balance-panel" aria-live="polite">
        <p className="balance-label">내 데이터</p>
        <p className="balance-value">{balanceMb}MB</p>
        <p className="balance-hint">
          광고 시청 후 서버 DB에 저장되는 개인 잔액입니다. 충전 기능은 다음
          단계에서 연결됩니다.
        </p>
      </section>

      <section className="dashboard-notes">
        <h2>다음 단계</h2>
        <ul>
          <li>광고 시청 세션과 서버 검증</li>
          <li>시청 완료 시 +10MB DB 충전</li>
          <li>사전 구매 eSIM 최초 배정</li>
        </ul>
      </section>
    </main>
  );
}
