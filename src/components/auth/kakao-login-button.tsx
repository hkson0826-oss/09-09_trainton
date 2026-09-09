"use client";

import { useFormStatus } from "react-dom";

import { startKakaoLogin } from "@/lib/auth/actions";
import type { AuthProviderStatus } from "@/lib/auth/providers";

function SubmitButton({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      aria-disabled={!enabled || pending}
      className="kakao-btn"
    >
      {pending ? "카카오로 이동 중…" : label}
    </button>
  );
}

export function KakaoLoginButton({
  status,
  returnTo = "/dashboard",
}: {
  status: AuthProviderStatus;
  returnTo?: string;
}) {
  if (!status.enabled) {
    return (
      <div className="login-status" role="status">
        <button type="button" className="kakao-btn is-disabled" disabled>
          {status.label} (설정 대기)
        </button>
        <p className="login-status-copy">{status.reason}</p>
      </div>
    );
  }

  return (
    <form action={startKakaoLogin} className="login-form">
      <input type="hidden" name="returnTo" value={returnTo} />
      <SubmitButton enabled label={status.label} />
    </form>
  );
}
