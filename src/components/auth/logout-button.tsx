"use client";

import { useFormStatus } from "react-dom";

import { signOut } from "@/lib/auth/actions";

function LogoutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="logout-btn" disabled={pending}>
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={signOut}>
      <LogoutSubmit />
    </form>
  );
}
