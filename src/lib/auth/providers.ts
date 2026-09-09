import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthProviderId = "kakao";

export type AuthProviderStatus = {
  id: AuthProviderId;
  label: string;
  enabled: boolean;
  reason?: string;
};

export function getKakaoAuthStatus(): AuthProviderStatus {
  if (!isSupabaseConfigured()) {
    return {
      id: "kakao",
      label: "카카오 로그인",
      enabled: false,
      reason: "Supabase 환경 변수가 아직 설정되지 않았습니다.",
    };
  }

  const flag = process.env.NEXT_PUBLIC_KAKAO_AUTH_ENABLED?.trim().toLowerCase();
  const enabled = flag === "true" || flag === "1" || flag === "yes";

  if (!enabled) {
    return {
      id: "kakao",
      label: "카카오 로그인",
      enabled: false,
      reason:
        "카카오 OAuth가 설정 대기 중입니다. NEXT_PUBLIC_KAKAO_AUTH_ENABLED=true 와 Supabase/Kakao 콘솔 설정을 완료하세요.",
    };
  }

  return {
    id: "kakao",
    label: "카카오로 계속하기",
    enabled: true,
  };
}
