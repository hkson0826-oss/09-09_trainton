import { LandingView } from "@/components/landing/landing-view";
import { getKakaoAuthStatus } from "@/lib/auth/providers";
import { sanitizeReturnTo } from "@/lib/auth/return-to";

export const dynamic = "force-dynamic";

export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const errorRaw = searchParams.error;
  const loggedOutRaw = searchParams.loggedOut;
  const returnToRaw = searchParams.returnTo;

  const errorCode = typeof errorRaw === "string" ? errorRaw : null;
  const loggedOut = loggedOutRaw === "1" || loggedOutRaw === "true";
  const returnTo = sanitizeReturnTo(
    typeof returnToRaw === "string" ? returnToRaw : undefined,
  );

  return (
    <LandingView
      kakaoStatus={getKakaoAuthStatus()}
      errorCode={errorCode}
      loggedOut={loggedOut}
      returnTo={returnTo}
    />
  );
}
