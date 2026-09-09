import { KakaoLoginButton } from "@/components/auth/kakao-login-button";
import type { AuthProviderStatus } from "@/lib/auth/providers";

const ERROR_MESSAGES: Record<string, string> = {
  login_cancelled: "카카오 로그인을 취소했습니다. 다시 시도할 수 있습니다.",
  oauth_callback_error: "로그인 콜백에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  oauth_start_failed: "카카오 로그인을 시작하지 못했습니다. 설정을 확인해 주세요.",
  missing_auth_code: "인증 코드가 없습니다. 로그인을 다시 시작해 주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  kakao_not_configured: "카카오 로그인이 아직 설정되지 않았습니다.",
  session_exchange_failed: "세션을 확정하지 못했습니다. 다시 로그인해 주세요.",
};

export function LandingView({
  kakaoStatus,
  errorCode,
  loggedOut,
  returnTo,
}: {
  kakaoStatus: AuthProviderStatus;
  errorCode?: string | null;
  loggedOut?: boolean;
  returnTo: string;
}) {
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : null;

  return (
    <main className="landing">
      <div className="landing-atmosphere" aria-hidden />
      <section className="landing-hero">
        <p className="brand">Trainton</p>
        <h1 className="headline">광고를 보면 데이터가 바로 충전됩니다</h1>
        <p className="support">
          카카오로 로그인한 뒤 광고를 시청하면, 내 데이터 잔액이 서버에 즉시
          저장됩니다. 시연용 eSIM은 한정 수량으로 준비됩니다.
        </p>

        <div className="cta-block">
          <KakaoLoginButton status={kakaoStatus} returnTo={returnTo} />
          <p className="stock-note">한정 수량 · 사전 구매 eSIM 재고 기준</p>
        </div>

        {errorMessage ? (
          <p className="banner banner-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {loggedOut ? (
          <p className="banner banner-info" role="status">
            로그아웃되었습니다. 개인 데이터 표시가 초기화되었습니다.
          </p>
        ) : null}
      </section>
    </main>
  );
}
